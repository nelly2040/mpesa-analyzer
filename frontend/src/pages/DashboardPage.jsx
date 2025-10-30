import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import TransactionList from '../components/TransactionList';
import DashboardSummary from '../components/DashboardSummary'; // Import the new component
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null); // Add state for summary data
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const transData = await transactionService.getTransactions();
            const summaryData = await transactionService.getSummary(); // Fetch summary
            setTransactions(transData);
            setSummary(summaryData); // Set summary state
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
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
            fetchData(); // Refetch all data to update everything
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
                {/* ... header content ... */}
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Add the Summary component here */}
                    {loading ? <p>Loading summary...</p> : <DashboardSummary summary={summary} />}

                    {loading ? <p>Loading transactions...</p> : <TransactionList transactions={transactions} />}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;