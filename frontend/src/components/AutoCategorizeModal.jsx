import React, { useState } from 'react';

const AutoCategorizeModal = ({ isOpen, onClose, onCategorize, transactions }) => {
    const [scope, setScope] = useState('all'); // 'all' or 'selected'
    const [selectedTransactions, setSelectedTransactions] = useState([]);

    if (!isOpen) return null;

    const uncategorizedCount = transactions.filter(t => t.category === 'Other' || !t.category).length;
    const totalCount = transactions.length;

    const handleSubmit = (e) => {
        e.preventDefault();
        const transactionIds = scope === 'selected' ? selectedTransactions : [];
        onCategorize(transactionIds);
    };

    const toggleTransaction = (id) => {
        setSelectedTransactions(prev => 
            prev.includes(id) 
                ? prev.filter(tId => tId !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedTransactions(transactions.map(t => t._id));
    };

    const clearSelection = () => {
        setSelectedTransactions([]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Auto-Categorize Transactions</h2>
                    
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                        <p className="text-blue-700 text-sm">
                            This feature will analyze your transaction descriptions and automatically assign 
                            categories based on common patterns (e.g., "Naivas" → Food, "KPLC" → Utilities).
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Scope Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Which transactions would you like to categorize?
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="all"
                                        checked={scope === 'all'}
                                        onChange={(e) => setScope(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span>All transactions ({totalCount} total)</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="selected"
                                        checked={scope === 'selected'}
                                        onChange={(e) => setScope(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span>Selected transactions only</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="uncategorized"
                                        checked={scope === 'uncategorized'}
                                        onChange={(e) => setScope(e.target.value)}
                                        className="mr-2"
                                    />
                                    <span>Only uncategorized transactions ({uncategorizedCount} found)</span>
                                </label>
                            </div>
                        </div>

                        {/* Transaction Selection (only when scope is 'selected') */}
                        {scope === 'selected' && (
                            <div className="mb-6 max-h-60 overflow-y-auto border rounded-lg">
                                <div className="bg-gray-50 p-3 flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        Select transactions to categorize:
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={selectAll}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearSelection}
                                            className="text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                                <div className="divide-y">
                                    {transactions.map(transaction => (
                                        <label key={transaction._id} className="flex items-center p-3 hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedTransactions.includes(transaction._id)}
                                                onChange={() => toggleTransaction(transaction._id)}
                                                className="mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{transaction.description}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        transaction.type === 'income' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {transaction.type}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                    <span>Current: {transaction.category}</span>
                                                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                Auto-Categorize
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AutoCategorizeModal;