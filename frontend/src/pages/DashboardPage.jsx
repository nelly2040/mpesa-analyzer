import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import SmsImportModal from '../components/SmsImportModal';
import TransactionList from '../components/TransactionList';
import DashboardSummary from '../components/DashboardSummary';
import ExpenseChart from '../components/ExpenseChart';
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            setError('');
            const [transData, summaryData] = await Promise.all([
                transactionService.getTransactions(),
                transactionService.getSummary()
            ]);
            setTransactions(transData);
            setSummary(summaryData);
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

    const handleSaveTransaction = async (transactionData) => {
        try {
            setError('');
            if (transactionToEdit) {
                // Editing existing transaction
                await transactionService.updateTransaction(transactionToEdit._id, transactionData);
            } else {
                // Adding new transaction
                await transactionService.addTransaction(transactionData);
            }
            // Refresh data and close modal
            await fetchData();
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
                await fetchData(); // Refresh the data
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
            await fetchData(); // Refresh all dashboard data after import
        } catch (error) {
            console.error('Failed to import SMS:', error);
            setError('Failed to import SMS transactions. Please check the format and try again.');
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

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex gap-4">
                        {/* Import SMS Button */}
                        <button
                            onClick={() => setIsSmsModalOpen(true)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                        >
                            Import SMS
                        </button>
                        {/* Add Transaction Button */}
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                        >
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

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500 text-lg">Loading dashboard data...</p>
                            </div>
                        </div>
                    ) : (
                        // Render components only if summary data is available
                        summary ? (
                            <>
                                <DashboardSummary summary={summary} />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Ensure data for ExpenseChart is correctly formatted */}
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
                                    <div className="flex gap-4 justify-center">
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