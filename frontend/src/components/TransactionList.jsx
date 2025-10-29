import React from 'react';

// A helper function to format the date nicely
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// A helper function to format currency
const formatCurrency = (amount) => {
    return `Ksh ${amount.toLocaleString('en-US')}`;
};

const TransactionList = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No transactions yet. Click "Add Transaction" to get started!
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 p-4 border-b">Recent Transactions</h3>
            <ul>
                {transactions.map((t) => (
                    <li key={t._id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-4 ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="font-semibold text-gray-900">{t.description}</p>
                                <p className="text-sm text-gray-500">{formatDate(t.date)} • {t.category}</p>
                            </div>
                        </div>
                        <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionList;