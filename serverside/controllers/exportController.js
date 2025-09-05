// controllers/exportController.js
import PDFDocument from "pdfkit";
import User from "../models/User.js";
import Transaction from "../models/ExpenseModel.js";

export const exportUserReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user
    const user = await User.findById(userId).select("username email _id");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get all transactions
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    // Calculate monthly totals
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    const monthlyIncome = monthlyTotals.find(t => t._id === "income")?.total || 0;
    const monthlyExpense = monthlyTotals.find(t => t._id === "expense")?.total || 0;
    const totalBalance = monthlyIncome - monthlyExpense;

    // Calculate additional analytics
    const yearlyTotals = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { 
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lt: new Date(new Date().getFullYear() + 1, 0, 1)
          }
        }
      },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]);

    const yearlyIncome = yearlyTotals.find(t => t._id === "income")?.total || 0;
    const yearlyExpense = yearlyTotals.find(t => t._id === "expense")?.total || 0;

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: "expense",
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Generate PDF with professional styling
    const doc = new PDFDocument({ 
      margin: 60,
      size: 'A4'
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MoneyManager_Report_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`
    );
    doc.pipe(res);

    // Define colors
    const primaryColor = '#2563EB';
    const secondaryColor = '#1E40AF';
    const accentColor = '#F59E0B';
    const successColor = '#10B981';
    const dangerColor = '#EF4444';
    const grayColor = '#6B7280';
    const lightGrayColor = '#F3F4F6';

    // Helper function to draw a header bar
    const drawHeaderBar = (y, height = 3) => {
      doc.rect(60, y, doc.page.width - 120, height)
         .fillAndStroke(primaryColor, primaryColor);
    };

    // Helper function to draw section background
    const drawSectionBackground = (y, height, color = lightGrayColor) => {
      doc.rect(60, y, doc.page.width - 120, height)
         .fill(color)
         .stroke();
    };

    // Page header with company branding
    doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
    
    doc.fillColor('white')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('MONEY MANAGER', 60, 25);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('Professional Financial Reporting Suite', 60, 55);

    // Add a subtle gradient line
    drawHeaderBar(82, 2);

    doc.fillColor('black').moveDown(3);

    // Report Title and Date
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor(secondaryColor)
       .text('Financial Analysis Report', 60, 110, { align: 'center' });

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(grayColor)
       .text(`Generated on ${currentDate}`, 60, 140, { align: 'center' });

    doc.moveDown(2);

    // User Information Section with background
    const userInfoY = doc.y;
    drawSectionBackground(userInfoY - 10, 80);

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('👤 Account Information', 70, userInfoY);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('black')
       .text(`Account Holder: ${user.username}`, 70, userInfoY + 25)
       .text(`Email Address: ${user.email}`, 70, userInfoY + 42)
       .text(`Account ID: ${user._id}`, 70, userInfoY + 59);

    doc.moveDown(2);

    // Financial Overview - Key Metrics
    const metricsY = doc.y;
    drawSectionBackground(metricsY - 10, 120);

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('📊 Financial Overview', 70, metricsY);

    // Current month metrics
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(secondaryColor)
       .text(`${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Summary`, 70, metricsY + 25);

    const incomeColor = monthlyIncome > 0 ? successColor : grayColor;
    const expenseColor = monthlyExpense > 0 ? dangerColor : grayColor;
    const balanceColor = totalBalance >= 0 ? successColor : dangerColor;

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(incomeColor)
       .text(`💰 Total Income: $${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 70, metricsY + 45)
       .fillColor(expenseColor)
       .text(`💸 Total Expenses: $${monthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 70, metricsY + 62)
       .fillColor(balanceColor)
       .font('Helvetica-Bold')
       .text(`📈 Net Balance: $${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 70, metricsY + 79);

    // Yearly totals
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(grayColor)
       .text(`${new Date().getFullYear()} YTD Income: $${yearlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 320, metricsY + 45)
       .text(`${new Date().getFullYear()} YTD Expenses: $${yearlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 320, metricsY + 62)
       .font('Helvetica-Bold')
       .text(`YTD Net: $${(yearlyIncome - yearlyExpense).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 320, metricsY + 79);

    doc.moveDown(2);

    // Top Expense Categories
    if (categoryBreakdown.length > 0) {
      const categoryY = doc.y;
      drawSectionBackground(categoryY - 10, Math.min(categoryBreakdown.length * 18 + 40, 200));

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(primaryColor)
         .text('🏷️ Top Expense Categories', 70, categoryY);

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(grayColor)
         .text('Current month breakdown', 70, categoryY + 20);

      categoryBreakdown.forEach((cat, index) => {
        const percentage = ((cat.total / monthlyExpense) * 100).toFixed(1);
        const yPos = categoryY + 40 + (index * 18);
        
        doc.fontSize(10)
           .fillColor('black')
           .text(`${index + 1}. ${cat._id || 'Uncategorized'}`, 75, yPos)
           .text(`$${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${percentage}%)`, 300, yPos)
           .text(`${cat.count} transactions`, 450, yPos);
      });

      doc.moveDown(2);
    }

    // Transaction History
    doc.addPage();
    
    // Page header for second page
    doc.rect(0, 0, doc.page.width, 60).fill(primaryColor);
    doc.fillColor('white')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('MONEY MANAGER', 60, 20);
    
    drawHeaderBar(62, 2);
    doc.fillColor('black').moveDown(2);

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('📝 Transaction History', 60, 90);

    doc.fontSize(11)
       .font('Helvetica')
       .fillColor(grayColor)
       .text(`Showing ${Math.min(transactions.length, 50)} most recent transactions`, 60, 110);

    // Table headers
    const tableStartY = 140;
    doc.rect(60, tableStartY, doc.page.width - 120, 20).fill(lightGrayColor);
    
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('black')
       .text('Date', 70, tableStartY + 6)
       .text('Description', 130, tableStartY + 6)
       .text('Category', 280, tableStartY + 6)
       .text('Type', 350, tableStartY + 6)
       .text('Amount', 420, tableStartY + 6);

    // Transaction rows
    let currentY = tableStartY + 25;
    const maxTransactions = Math.min(transactions.length, 50);

    for (let i = 0; i < maxTransactions; i++) {
      const txn = transactions[i];
      
      // Alternate row colors
      if (i % 2 === 0) {
        doc.rect(60, currentY - 3, doc.page.width - 120, 16).fill('#FAFAFA');
      }

      const typeColor = txn.type === 'income' ? successColor : dangerColor;
      const amountPrefix = txn.type === 'income' ? '+$' : '-$';

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('black')
         .text(new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), 70, currentY)
         .text(txn.title.substring(0, 20) + (txn.title.length > 20 ? '...' : ''), 130, currentY)
         .text((txn.category || 'Other').substring(0, 12), 280, currentY)
         .fillColor(typeColor)
         .text(txn.type.toUpperCase(), 350, currentY)
         .font('Helvetica-Bold')
         .text(`${amountPrefix}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 420, currentY);

      currentY += 16;

      // Add new page if needed
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        
        // Repeat header on new page
        doc.rect(0, 0, doc.page.width, 60).fill(primaryColor);
        doc.fillColor('white')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('MONEY MANAGER', 60, 20);
        
        drawHeaderBar(62, 2);
        currentY = 90;
      }

      doc.fillColor('black').font('Helvetica');
    }

    // Footer with professional styling
    doc.fontSize(8)
       .fillColor(grayColor)
       .text('This report is confidential and intended solely for the account holder.', 60, doc.page.height - 60, { align: 'center' })
       .text('Generated by Money Manager © 2025 | For support, contact support@moneymanager.com', 60, doc.page.height - 45, { align: 'center' });

    // Add page numbers - FIXED VERSION
    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < (pages.start + pages.count); i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor(grayColor)
         .text(`Page ${i - pages.start + 1} of ${pages.count}`, doc.page.width - 100, doc.page.height - 30, { align: 'right' });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
};