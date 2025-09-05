    const budgetData = {
    monthly: { limit: 3500, spent: 2450, percentage: 70 },
    categories: [
      { name: 'Food', limit: 500, spent: 450, percentage: 90 },
      { name: 'Transport', limit: 400, spent: 300, percentage: 75 },
      { name: 'Entertainment', limit: 300, spent: 200, percentage: 67 }
    ]
  };
  
  
  const BudgetTrackingSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Budget Tracking</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Budget</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              budgetData.monthly.percentage > 90 ? 'bg-red-100 text-red-800' :
              budgetData.monthly.percentage > 75 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {budgetData.monthly.percentage}% Used
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Spent: ${budgetData.monthly.spent}</span>
              <span>Limit: ${budgetData.monthly.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  budgetData.monthly.percentage > 90 ? 'bg-red-500' :
                  budgetData.monthly.percentage > 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetData.monthly.percentage, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Remaining: ${budgetData.monthly.limit - budgetData.monthly.spent}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Category Budgets</h3>
          {budgetData.categories.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{category.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  category.percentage > 90 ? 'bg-red-100 text-red-800' :
                  category.percentage > 75 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {category.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${
                    category.percentage > 90 ? 'bg-red-500' :
                    category.percentage > 75 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>${category.spent} spent</span>
                <span>${category.limit} limit</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


export default BudgetTrackingSection