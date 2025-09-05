  
  import { 
    Plus,

  } from 'lucide-react';

    const upcomingBills = [
      { name: 'Rent', amount: 1200, dueDate: '2024-09-05', status: 'upcoming' },
      { name: 'Electricity', amount: 85, dueDate: '2024-09-07', status: 'upcoming' },
      { name: 'Internet', amount: 60, dueDate: '2024-09-10', status: 'overdue' }
    ];
  
  
  const BillsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Bills</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </button>
        </div>
        
        <div className="space-y-4">
          {upcomingBills.map((bill, index) => (
            <div key={index} className={`border-l-4 ${
              bill.status === 'overdue' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
            } rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{bill.name}</h4>
                  <p className="text-sm text-gray-600">Due: {bill.dueDate}</p>
                  {bill.status === 'overdue' && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mt-1">
                      Overdue
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${bill.amount}</p>
                  <button className={`px-3 py-1 rounded text-sm ${
                    bill.status === 'overdue' ? 'bg-red-600 text-white hover:bg-red-700' : 
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

export default BillsSection;