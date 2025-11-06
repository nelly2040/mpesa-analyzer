import React from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Recent Transactions</h3>
                <div className="p-8 text-center text-gray-500">
                    <p>No transactions yet. Add your first transaction to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Recent Transactions</h3>
            <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                    <li key={transaction._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        transaction.type === 'income' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {transaction.type}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {transaction.category}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-900">{transaction.description}</p>
                                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-semibold ${
                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </span>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(transaction)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(transaction._id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;