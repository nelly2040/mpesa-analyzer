import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import SmsImportModal from '../components/SmsImportModal'; // Assuming you have this component
import TransactionList from '../components/TransactionList';
import DashboardSummary from '../components/DashboardSummary';
import ExpenseChart from '../components/ExpenseChart';
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null); // Stays null initially
    const [loading, setLoading] = useState(true);
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const transData = await transactionService.getTransactions();
            const summaryData = await transactionService.getSummary();
            setTransactions(transData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Consider setting an error state here to display a user-friendly message
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTransaction = async (transactionData) => {
        try {
            await transactionService.addTransaction(transactionData);
            fetchData(); // Refresh all dashboard data after adding
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add transaction:', error);
            // Consider displaying an error message to the user
        }
    };

    const handleSmsImport = async (text) => {
        try {
            const result = await transactionService.parseSms(text);
            alert(result.message); // Show a success message (consider a more sophisticated UI notification)
            setIsSmsModalOpen(false);
            fetchData(); // Refresh all dashboard data after import
        } catch (error) {
            console.error('Failed to import SMS:', error);
            alert('An error occurred during SMS import.'); // User-friendly error
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            {/* Transaction Modal - Corrected props usage */}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddTransaction={handleAddTransaction} // Prop for adding a new transaction
            />

            {/* SMS Import Modal */}
            <SmsImportModal
                isOpen={isSmsModalOpen}
                onClose={() => setIsSmsModalOpen(false)}
                onImport={handleSmsImport}
            />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex gap-4">
                        {/* Import SMS Button */}
                        <button
                            onClick={() => setIsSmsModalOpen(true)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Import SMS
                        </button>
                        {/* Add Transaction Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            Add Transaction
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">Loading dashboard data...</p>
                    ) : (
                        // Render components only if summary data is available
                        summary ? (
                            <>
                                <DashboardSummary summary={summary} />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    {/* Ensure data for ExpenseChart is correctly formatted */}
                                    <ExpenseChart data={summary.expenseByCategory || {}} />
                                    <TransactionList transactions={transactions} />
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 text-lg">No data available. Add your first transaction!</p>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;