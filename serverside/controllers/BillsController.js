import Bill from "../models/BillsModel.js";
import Transaction from "../models/ExpenseModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import User from "../models/User.js";
// Razorpay instance (test mode)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Add Bill
export const addBill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, amount, dueDate, notes } = req.body;

    // Validation
    if (!title || !amount || !dueDate) {
      return res.status(400).json({ message: "Title, amount, and due date are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Check if due date is valid
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    // Determine initial status based on due date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);
    
    let status = 'pending';
    if (dueDateObj < today) {
      status = 'overdue';
    }

    const bill = new Bill({
      userId,
      title: title.trim(),
      amount: Number(amount),
      dueDate: dueDateObj,
      notes: notes ? notes.trim() : undefined,
      status,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    console.error("Add bill error:", error);
    res.status(500).json({ message: error.message || "Failed to add bill" });
  }
};

// ✅ Get All Bills of User with automatic status updates
export const getBills = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // First, update overdue bills
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Bill.updateMany(
      { 
        userId, 
        status: 'pending', 
        dueDate: { $lt: today } 
      },
      { status: 'overdue' }
    );
    
    // Then fetch all bills
    const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch bills" });
  }
};

// ✅ Create Razorpay Order for Bill Payment
export const createBillPaymentOrder = async (req, res) => {
  try {
    const { billId } = req.body;
    const userId = req.user._id;

    if (!billId) {
      return res.status(400).json({ message: "Bill ID is required" });
    }

    const bill = await Bill.findOne({ _id: billId, userId });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    
    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }

const options = {
  amount: Math.round(bill.amount * 100), // paise
  currency: "INR",
  receipt: `bill_${bill._id.toString().slice(-10)}`, // take last 10 chars
  payment_capture: 1,
};


    const order = await razorpay.orders.create(options);

    res.status(200).json({ order, bill });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message || "Failed to create payment order" });
  }
};

// ✅ Verify Payment & Mark Bill Paid
export const verifyBillPayment = async (req, res) => {
  try {
    const { 
      billId, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      paymentMethod 
    } = req.body;
    const userId = req.user._id;
    

    // Validation
    if (!billId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    const bill = await Bill.findOne({ _id: billId, userId });
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }

    // ✅ Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "your_secret_here")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ Create Transaction
    const transaction = new Transaction({
  userId: bill.userId,
  title: `Bill Payment - ${bill.title}`,
  amount: bill.amount,
  type: "expense",
  category: "Bill Payment",
  paymentMethod: paymentMethod || "Razorpay",
  notes: bill.notes || `Payment for bill: ${bill.title}`,
});
await transaction.save();

// ✅ Update Bill
bill.status = "paid";
bill.paymentMethod = paymentMethod || "Razorpay";
bill.transactionId = transaction._id;
bill.paidAt = new Date();
await bill.save();

const user = await User.findById(userId).select("email username");
console.log('====================================');
console.log("user :",user.username);
console.log('====================================');
if (user?.email) {
  const paymentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailSubject = `Payment Confirmation - ${bill.title} | Transaction ID: ${transaction._id.toString().slice(-8)}`;
  
  const emailText = `
Dear ${user.username || 'Valued Customer'},

We are pleased to confirm that your payment has been processed successfully.

Payment Details:
- Bill: ${bill.title}
- Amount Paid: ₹${bill.amount}
- Payment Method: ${paymentMethod || "Razorpay"}
- Transaction ID: ${transaction._id}
- Payment Date: ${paymentDate}
- Status: Paid

${bill.notes ? `Bill Notes: ${bill.notes}` : ''}

This payment has been recorded in your account and your bill status has been updated to "Paid".

If you have any questions regarding this payment or need assistance, please don't hesitate to contact our support team.

Thank you for your prompt payment.

Best regards,
The Money Manager Team
`;

  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            color: #333; 
        }
        .header { 
            background-color: #4CAF50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
        }
        .content { 
            padding: 30px 20px; 
            background-color: #f9f9f9; 
        }
        .payment-details { 
            background-color: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 5px; 
            border-left: 4px solid #4CAF50; 
        }
        .detail-row { 
            margin: 10px 0; 
            padding: 5px 0; 
            border-bottom: 1px solid #eee; 
        }
        .label { 
            font-weight: bold; 
            display: inline-block; 
            width: 140px; 
        }
        .success-badge { 
            background-color: #4CAF50; 
            color: white; 
            padding: 5px 15px; 
            border-radius: 15px; 
            font-size: 12px; 
            font-weight: bold; 
        }
        .footer { 
            background-color: #f1f1f1; 
            padding: 15px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
        }
        .transaction-id { 
            font-family: monospace; 
            background-color: #e8e8e8; 
            padding: 2px 6px; 
            border-radius: 3px; 
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>✅ Payment Confirmation</h2>
            <p>Your payment has been processed successfully</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${user.username || 'Valued Customer'}</strong>,</p>
            
            <p>We are pleased to confirm that your payment has been processed successfully.</p>
            
            <div class="payment-details">
                <h3 style="margin-top: 0; color: #4CAF50;">Payment Details</h3>
                
                <div class="detail-row">
                    <span class="label">Bill:</span>
                    <span>${bill.title}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Amount Paid:</span>
                    <span style="font-weight: bold; color: #4CAF50;">₹${bill.amount}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Payment Method:</span>
                    <span>${paymentMethod || "Razorpay"}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Transaction ID:</span>
                    <span class="transaction-id">${transaction._id}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Payment Date:</span>
                    <span>${paymentDate}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none;">
                    <span class="label">Status:</span>
                    <span class="success-badge">PAID</span>
                </div>
                
                ${bill.notes ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    <span class="label">Notes:</span>
                    <span>${bill.notes}</span>
                </div>
                ` : ''}
            </div>
            
            <p>This payment has been recorded in your account and your bill status has been updated to <strong>"Paid"</strong>.</p>
            
            <p>If you have any questions regarding this payment or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for your prompt payment.</p>
            
            <p>Best regards,<br>
            <strong>The Money Manager Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Transaction Reference: ${transaction._id.toString().slice(-8).toUpperCase()}</p>
        </div>
    </div>
</body>
</html>
`;

  await sendEmail(
    user.email,
    emailSubject,
    emailText,
    emailHTML
  );
  
  console.log(`Payment confirmation email sent to ${user.email} for transaction ${transaction._id}`);
}

    res.status(200).json({ 
      message: "Payment verified and bill marked as paid", 
      bill, 
      transaction 
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};

// ✅ Delete Bill (Fixed route parameter handling)
export const deleteBill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { billId } = req.params; // Get from URL parameters

    if (!billId) {
      return res.status(400).json({ message: "Bill ID is required" });
    }

    const bill = await Bill.findOne({ _id: billId, userId });
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Prevent deletion of paid bills (optional business rule)
    if (bill.status === 'paid') {
      return res.status(400).json({ message: "Cannot delete paid bills" });
    }

    // If bill is paid and has a linked transaction, delete it too
    if (bill.transactionId) {
      await Transaction.findByIdAndDelete(bill.transactionId);
    }

    await Bill.findByIdAndDelete(billId);

    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Delete bill error:", error);
    res.status(500).json({ message: error.message || "Failed to delete bill" });
  }
};

// ✅ Get Bill Statistics
export const getBillStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update overdue bills first
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Bill.updateMany(
      { 
        userId, 
        status: 'pending', 
        dueDate: { $lt: today } 
      },
      { status: 'overdue' }
    );

    const stats = await Bill.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Format the stats
    const formattedStats = {
      pending: { count: 0, totalAmount: 0 },
      paid: { count: 0, totalAmount: 0 },
      overdue: { count: 0, totalAmount: 0 }
    };

    stats.forEach(stat => {
      if (formattedStats[stat._id]) {
        formattedStats[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
      }
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch statistics" });
  }
};