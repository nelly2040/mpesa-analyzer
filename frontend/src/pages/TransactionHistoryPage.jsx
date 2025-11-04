// frontend/src/pages/TransactionHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TransactionList from '../components/TransactionList'; // We'll reuse this component
import transactionService from '../services/transactionService';

const TransactionHistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State for filtering and search (we'll implement these later)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            // We will modify transactionService.getTransactions to accept filters
            const data = await transactionService.getTransactions({
                startDate,
                endDate,
                searchTerm
            });
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError('Failed to load transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [startDate, endDate, searchTerm]); // Re-fetch when filters change

    // TODO: Add functions for handling edit and delete operations

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Filter and Search Bar (will be added here) */}
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter & Search</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Search Description</label>
                                <input
                                    type="text"
                                    id="searchTerm"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="e.g., KPLC, Groceries"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-500 text-lg">Loading transactions...</p>
                    ) : error ? (
                        <p className="text-center text-red-500 text-lg">{error}</p>
                    ) : transactions.length === 0 ? (
                        <p className="text-center text-gray-500 text-lg">No transactions found for the selected criteria.</p>
                    ) : (
                        // Reuse the existing TransactionList component
                        <TransactionList transactions={transactions} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default TransactionHistoryPage;