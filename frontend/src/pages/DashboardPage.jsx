import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import TransactionList from '../components/TransactionList';
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transactions when the component mounts
    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAddTransaction = async (transactionData) => {
        try {
            const newTransaction = await transactionService.addTransaction(transactionData);
            setTransactions([newTransaction, ...transactions]); // Add new transaction to the top of the list
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
                    {/* Replace the dashed box with our TransactionList */}
                    {loading ? <p>Loading transactions...</p> : <TransactionList transactions={transactions} />}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;