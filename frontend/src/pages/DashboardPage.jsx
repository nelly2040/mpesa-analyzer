import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import TransactionList from '../components/TransactionList';
import DashboardSummary from '../components/DashboardSummary';
import ExpenseChart from '../components/ExpenseChart';
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null); // Stays null initially
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // No need to set loading here, it's already true
            const transData = await transactionService.getTransactions();
            const summaryData = await transactionService.getSummary();
            setTransactions(transData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // We could set an error state here to show a message
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
            // After adding, just refetch all data to ensure consistency
            fetchData(); 
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add transaction:', error);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddTransaction={handleAddTransaction}
            />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700"
                    >
                        Add Transaction
                    </button>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* THIS IS THE CORRECTED LOGIC */}
                    {loading ? (
                        <p className="text-center text-gray-500">Loading dashboard...</p>
                    ) : (
                        // We only render the components if the summary data exists
                        summary && (
                            <>
                                <DashboardSummary summary={summary} />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    <ExpenseChart data={summary.expenseByCategory} />
                                    <TransactionList transactions={transactions} />
                                </div>
                            </>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;