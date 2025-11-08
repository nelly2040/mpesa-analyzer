import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import SmsImportModal from '../components/SmsImportModal';
import AutoCategorizeModal from '../components/AutoCategorizeModal';
import TransactionList from '../components/TransactionList';
import DashboardSummary from '../components/DashboardSummary';
import ExpenseChart from '../components/ExpenseChart';
import TransactionFilter from '../components/TransactionFilter';
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [isAutoCategorizeModalOpen, setIsAutoCategorizeModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [error, setError] = useState('');
    const [activeFilters, setActiveFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = async (filters = {}) => {
        try {
            setError('');
            setLoading(true);
            
            const [transData, summaryData] = await Promise.all([
                transactionService.getTransactions(filters),
                transactionService.getSummary(filters)
            ]);
            
            setTransactions(transData);
            setSummary(summaryData);
            setActiveFilters(filters);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilter = (filters) => {
        fetchData(filters);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        fetchData();
        setShowFilters(false);
    };

    const handleSaveTransaction = async (transactionData) => {
        try {
            setError('');
            if (transactionToEdit) {
                await transactionService.updateTransaction(transactionToEdit._id, transactionData);
            } else {
                await transactionService.addTransaction(transactionData);
            }
            await fetchData(activeFilters);
            setIsModalOpen(false);
            setTransactionToEdit(null);
        } catch (error) {
            console.error('Failed to save transaction:', error);
            setError('Failed to save transaction. Please try again.');
        }
    };

    const handleEditTransaction = (transaction) => {
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
        setError('');
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            try {
                setError('');
                await transactionService.deleteTransaction(transactionId);
                await fetchData(activeFilters);
            } catch (error) {
                console.error('Failed to delete transaction:', error);
                setError('Failed to delete transaction. Please try again.');
            }
        }
    };

    const handleSmsImport = async (text) => {
        try {
            setError('');
            const result = await transactionService.parseSms(text);
            alert(result.message);
            setIsSmsModalOpen(false);
            await fetchData(activeFilters);
        } catch (error) {
            console.error('Failed to import SMS:', error);
            setError('Failed to import SMS transactions. Please check the format and try again.');
        }
    };

    const handleAutoCategorize = async (transactionIds = []) => {
        try {
            setError('');
            const result = await transactionService.autoCategorize(transactionIds);
            alert(`Successfully categorized ${result.updatedCount} transactions!`);
            setIsAutoCategorizeModalOpen(false);
            fetchData(activeFilters);
        } catch (error) {
            console.error('Failed to auto-categorize:', error);
            setError('Failed to auto-categorize transactions. Please try again.');
        }
    };

    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTransactionToEdit(null);
        setError('');
    };

    const handleCloseSmsModal = () => {
        setIsSmsModalOpen(false);
        setError('');
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTransaction}
                existingTransaction={transactionToEdit}
            />

            {/* SMS Import Modal */}
            <SmsImportModal
                isOpen={isSmsModalOpen}
                onClose={handleCloseSmsModal}
                onImport={handleSmsImport}
            />

            {/* Auto-Categorize Modal */}
            <AutoCategorizeModal
                isOpen={isAutoCategorizeModalOpen}
                onClose={() => setIsAutoCategorizeModalOpen(false)}
                onCategorize={handleAutoCategorize}
                transactions={transactions}
            />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex gap-3">
                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                </svg>
                                Filters
                            </button>
                            
                            {/* Reports Button */}
                            <Link 
                                to="/reports"
                                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Reports
                            </Link>
                            
                            {/* Budget Button */}
                            <Link 
                                to="/budget"
                                className="bg-orange-600 text-white font-bold py-2 px-4 rounded hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h-1m1 0h1" />
                                </svg>
                                Budget
                            </Link>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 flex-wrap">
                        {/* Auto-Categorize Button */}
                        <button
                            onClick={() => setIsAutoCategorizeModalOpen(true)}
                            className="bg-teal-600 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Auto-Categorize
                        </button>

                        {/* Import SMS Button */}
                        <button
                            onClick={() => setIsSmsModalOpen(true)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Import SMS
                        </button>
                        
                        {/* Add Transaction Button */}
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Transaction
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

                    {/* Active Filters Indicator */}
                    {Object.keys(activeFilters).some(key => 
                        activeFilters[key] && activeFilters[key] !== 'all' && activeFilters[key] !== ''
                    ) && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">
                                <strong>Active Filters:</strong> 
                                {activeFilters.type && activeFilters.type !== 'all' && ` Type: ${activeFilters.type}`}
                                {activeFilters.category && activeFilters.category !== 'all' && ` Category: ${activeFilters.category}`}
                                {activeFilters.startDate && ` From: ${activeFilters.startDate}`}
                                {activeFilters.endDate && ` To: ${activeFilters.endDate}`}
                                {activeFilters.search && ` Search: "${activeFilters.search}"`}
                                <button 
                                    onClick={handleClearFilters}
                                    className="ml-2 text-yellow-700 hover:text-yellow-900 underline text-sm"
                                >
                                    Clear All
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Transaction Filter Component */}
                    {showFilters && (
                        <TransactionFilter 
                            onFilter={handleFilter}
                            onClear={handleClearFilters}
                        />
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500 text-lg">Loading dashboard data...</p>
                            </div>
                        </div>
                    ) : (
                        summary ? (
                            <>
                                <DashboardSummary summary={summary} />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    <ExpenseChart data={summary.expenseByCategory || {}} />
                                    <TransactionList 
                                        transactions={transactions} 
                                        onEdit={handleEditTransaction}
                                        onDelete={handleDeleteTransaction}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Your Dashboard!</h3>
                                    <p className="text-gray-600 mb-6">
                                        Get started by adding your first transaction or importing M-Pesa SMS data.
                                    </p>
                                    <div className="flex gap-4 justify-center flex-wrap">
                                        <button
                                            onClick={() => setIsAutoCategorizeModalOpen(true)}
                                            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition-colors"
                                        >
                                            Auto-Categorize
                                        </button>
                                        <button
                                            onClick={() => setIsSmsModalOpen(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Import SMS
                                        </button>
                                        <button
                                            onClick={handleOpenAddModal}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                        >
                                            Add Transaction
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;