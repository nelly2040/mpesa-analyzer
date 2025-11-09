import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import BudgetModal from '../components/BudgetModal';
import BudgetSummary from '../components/BudgetSummary';
import budgetService from '../services/budgetService';

const BudgetPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [budgetSummary, setBudgetSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [budgetToEdit, setBudgetToEdit] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');

    const categories = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other', 'Salary', 'Sales', 'Gift'];

    // Set default month to current month
    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
        setSelectedMonth(currentMonth);
    }, []);

    // Use useCallback to memoize the function
    const fetchBudgetSummary = useCallback(async (month = selectedMonth) => {
        try {
            setError('');
            setLoading(true);
            const filters = { month };
            const summaryData = await budgetService.getBudgetSummary(filters);
            setBudgetSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch budget summary:', error);
            setError('Failed to load budget data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]); // Add dependencies here

    useEffect(() => {
        if (selectedMonth) {
            fetchBudgetSummary(selectedMonth);
        }
    }, [selectedMonth, fetchBudgetSummary]); // Now includes fetchBudgetSummary

    const handleSaveBudget = async (budgetData) => {
        try {
            setError('');
            await budgetService.setBudget(budgetData);
            await fetchBudgetSummary(selectedMonth);
            setIsModalOpen(false);
            setBudgetToEdit(null);
        } catch (error) {
            console.error('Failed to save budget:', error);
            setError('Failed to save budget. Please try again.');
        }
    };

    const handleEditBudget = (budgetItem) => {
        // Find the actual budget record to edit
        const budgetToEdit = {
            _id: budgetItem._id, // This might not be available in summary
            category: budgetItem.category,
            amount: budgetItem.budget,
            month: selectedMonth,
            year: parseInt(selectedMonth.split('-')[0])
        };
        setBudgetToEdit(budgetToEdit);
        setIsModalOpen(true);
        setError('');
    };

    const handleDeleteBudget = async (budgetItem) => {
        if (window.confirm(`Are you sure you want to delete the budget for ${budgetItem.category}?`)) {
            try {
                setError('');
                // We need to get the actual budget ID first
                const budgets = await budgetService.getBudgets({ month: selectedMonth });
                const budgetToDelete = budgets.find(b => b.category === budgetItem.category);
                
                if (budgetToDelete) {
                    await budgetService.deleteBudget(budgetToDelete._id);
                    await fetchBudgetSummary(selectedMonth);
                }
            } catch (error) {
                console.error('Failed to delete budget:', error);
                setError('Failed to delete budget. Please try again.');
            }
        }
    };

    const handleOpenAddModal = () => {
        setBudgetToEdit(null);
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setBudgetToEdit(null);
        setError('');
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            {/* Budget Modal */}
            <BudgetModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveBudget}
                existingBudget={budgetToEdit}
                categories={categories}
            />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                    <div className="flex gap-4 items-center">
                        {/* Month Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mr-2">Month:</label>
                            <input 
                                type="month" 
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        
                        {/* Add Budget Button */}
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition-colors"
                        >
                            Set Budget
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500 text-lg">Loading budget data...</p>
                            </div>
                        </div>
                    ) : (
                        <BudgetSummary 
                            budgetSummary={budgetSummary}
                            onEdit={handleEditBudget}
                            onDelete={handleDeleteBudget}
                        />
                    )}

                    {/* Help Section */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">About Budgets</h3>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Set monthly budgets for each spending category</li>
                            <li>• Track your spending against your budget with visual progress bars</li>
                            <li>• Get warnings when you're approaching your budget limits</li>
                            <li>• Categories without budgets will show as "No Budget"</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BudgetPage;