import React, { useState, useEffect } from 'react';

const TransactionModal = ({ isOpen, onClose, onSave, existingTransaction }) => {
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Food');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [description, setDescription] = useState('');

    const categories = {
        expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other'],
        income: ['Salary', 'Sales', 'Gift', 'Other'],
    };

    // Reset form when modal opens/closes or when existingTransaction changes
    useEffect(() => {
        if (existingTransaction) {
            // Edit mode - prefill with existing data
            setType(existingTransaction.type);
            setCategory(existingTransaction.category);
            setAmount(existingTransaction.amount.toString());
            setDate(new Date(existingTransaction.date).toISOString().slice(0, 10));
            setDescription(existingTransaction.description);
        } else {
            // Add mode - reset to defaults
            setType('expense');
            setCategory('Food');
            setAmount('');
            setDate(new Date().toISOString().slice(0, 10));
            setDescription('');
        }
    }, [existingTransaction, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const transactionData = {
            type,
            category,
            amount: parseFloat(amount),
            date,
            description,
        };
        onSave(transactionData);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {existingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Transaction Type */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                            <select 
                                value={type} 
                                onChange={(e) => {
                                    setType(e.target.value);
                                    setCategory(categories[e.target.value][0]); // Reset to first category
                                }} 
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                {categories[type].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Amount */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Amount (Ksh)</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                required 
                                step="0.01"
                                min="0"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                            />
                        </div>

                        {/* Date */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                required 
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                            <input 
                                type="text" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required 
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                placeholder="e.g., Groceries from Naivas" 
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                            >
                                {existingTransaction ? 'Save Changes' : 'Add Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;