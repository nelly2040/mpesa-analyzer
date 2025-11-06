// frontend/src/services/transactionService.js

import API from './api'; // Assuming 'api' is your Axios instance

const TRANSACTION_API_URL = '/api/transactions'; // Base URL for transaction endpoints

const transactionService = {
    // Fetches all transactions, now with optional filtering
    // filters can include: { startDate, endDate, searchTerm }
    getTransactions: async (filters = {}) => {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.searchTerm) {
                params.append('searchTerm', filters.searchTerm);
            }

            // Construct the URL with query parameters
            const url = `${TRANSACTION_API_URL}?${params.toString()}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error; // Re-throw to be handled by the component
        }
    },

    addTransaction: async (transactionData) => {
        try {
            const response = await api.post(TRANSACTION_API_URL, transactionData);
            return response.data;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    },

    getSummary: async () => {
        try {
            const response = await api.get(`${TRANSACTION_API_URL}/summary`);
            return response.data;
        } catch (error) {
            console.error('Error fetching summary:', error);
            throw error;
        }
    },

    parseSms: async (smsText) => {
        try {
            const response = await api.post(`${TRANSACTION_API_URL}/parse-sms`, { smsText });
            return response.data;
        } catch (error) {
            console.error('Error parsing SMS:', error);
            throw error;
        }
    }
};

export default transactionService;