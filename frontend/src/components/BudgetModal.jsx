import React, { useState, useEffect } from 'react';

const BudgetModal = ({ isOpen, onClose, onSave, existingBudget, categories }) => {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');

    // Set default month to current month (YYYY-MM)
    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
        setMonth(currentMonth);
    }, []);

    // Pre-fill form when editing
    useEffect(() => {
        if (existingBudget) {
            setCategory(existingBudget.category);
            setAmount(existingBudget.amount.toString());
            setMonth(existingBudget.month);
        } else {
            setCategory('');
            setAmount('');
            // Keep the default month for new budgets
        }
    }, [existingBudget, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const year = parseInt(month.split('-')[0]);
        const budgetData = {
            category,
            amount: parseFloat(amount),
            month,
            year
        };
        onSave(budgetData);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                        {existingBudget ? 'Edit Budget' : 'Set Budget'}
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Category */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                required
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Amount */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Budget Amount (Ksh)</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                required 
                                step="0.01"
                                min="0"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                placeholder="Enter budget amount"
                            />
                        </div>

                        {/* Month */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Month</label>
                            <input 
                                type="month" 
                                value={month} 
                                onChange={(e) => setMonth(e.target.value)} 
                                required 
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent" 
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
                                {existingBudget ? 'Update Budget' : 'Set Budget'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BudgetModal;