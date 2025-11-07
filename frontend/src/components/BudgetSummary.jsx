import React from 'react';

const BudgetSummary = ({ budgetSummary, onEdit, onDelete }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'exceeded': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'good': return 'bg-green-100 text-green-800';
            case 'no-budget': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'exceeded': return 'Exceeded';
            case 'warning': return 'Near Limit';
            case 'good': return 'On Track';
            case 'no-budget': return 'No Budget';
            default: return 'Unknown';
        }
    };

    if (!budgetSummary || !budgetSummary.summary || budgetSummary.summary.length === 0) {
        return (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Budget Summary</h3>
                <div className="p-8 text-center text-gray-500">
                    <p>No budgets set for this month. Set budgets to track your spending!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                    Budget Summary - {new Date(budgetSummary.month + '-01').toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="text-sm text-gray-600">
                    Total Budget: <strong>{formatCurrency(budgetSummary.totalBudget)}</strong> • 
                    Total Spent: <strong>{formatCurrency(budgetSummary.totalSpent)}</strong>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {budgetSummary.summary.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.category}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.budget)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.spent)}</td>
                                <td className={`px-4 py-3 text-sm font-medium ${
                                    item.remaining < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {formatCurrency(item.remaining)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                item.percentage >= 100 ? 'bg-red-600' :
                                                item.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-600'
                                            }`}
                                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {item.percentage.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {getStatusText(item.status)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {item.status !== 'no-budget' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BudgetSummary;