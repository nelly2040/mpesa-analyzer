import React, { useState } from 'react';

const TransactionModal = ({ isOpen, onClose, onAddTransaction }) => {
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Food'); // Default category
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Today's date
    const [description, setDescription] = useState('');

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
        onAddTransaction(transactionData);
    };

    const categories = {
        expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other'],
        income: ['Salary', 'Sales', 'Gift', 'Other'],
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Add New Transaction</h2>
                <form onSubmit={handleSubmit}>
                    {/* Transaction Type */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded">
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
                            {categories[type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    
                    {/* Amount */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Amount (Ksh)</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full p-2 border rounded" />
                    </div>

                    {/* Date */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-2 border rounded" />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-2 border rounded" placeholder="e.g., Groceries from Naivas" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;