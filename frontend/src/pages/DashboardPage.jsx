import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';
import transactionService from '../services/transactionService';

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // This function will be called when the form is submitted
    const handleAddTransaction = async (transactionData) => {
        try {
            const newTransaction = await transactionService.addTransaction(transactionData);
            console.log('Transaction added:', newTransaction);
            // We will add logic here to refresh the transaction list
            setIsModalOpen(false); // Close the modal on success
        } catch (error) {
            console.error('Failed to add transaction:', error);
            // You could show an error message to the user here
        }
    };

    return (
        <div>
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
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                            Welcome! Your transaction list and charts will appear here.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;