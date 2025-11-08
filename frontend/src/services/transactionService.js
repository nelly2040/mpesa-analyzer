import API from './api';

const TRANSACTION_API_URL = '/transactions';

const transactionService = {
    // Fetches all transactions
    getTransactions: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);

            const url = `${TRANSACTION_API_URL}?${params.toString()}`;
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    addTransaction: async (transactionData) => {
        try {
            const response = await API.post(TRANSACTION_API_URL, transactionData);
            return response.data;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    },

    getSummary: async () => {
        try {
            const response = await API.get(`${TRANSACTION_API_URL}/summary`);
            return response.data;
        } catch (error) {
            console.error('Error fetching summary:', error);
            throw error;
        }
    },

    parseSms: async (smsText) => {
        try {
            const response = await API.post(`${TRANSACTION_API_URL}/parse-sms`, { text: smsText });
            return response.data;
        } catch (error) {
            console.error('Error parsing SMS:', error);
            throw error;
        }
    },

    updateTransaction: async (id, transactionData) => {
        try {
            const response = await API.put(`${TRANSACTION_API_URL}/${id}`, transactionData);
            return response.data;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },

    deleteTransaction: async (id) => {
        try {
            const response = await API.delete(`${TRANSACTION_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    // Report functions
    getMonthlyReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.month) params.append('month', filters.month);

            const url = `${TRANSACTION_API_URL}/reports/monthly?${params.toString()}`;
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching monthly report:', error);
            throw error;
        }
    },

    getYearlyReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);

            const url = `${TRANSACTION_API_URL}/reports/yearly?${params.toString()}`;
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching yearly report:', error);
            throw error;
        }
    },

    // Auto-categorize function
    autoCategorize: async (transactionIds = []) => {
        try {
            const response = await API.post(`${TRANSACTION_API_URL}/auto-categorize`, {
                transactionIds
            });
            return response.data;
        } catch (error) {
            console.error('Error auto-categorizing transactions:', error);
            throw error;
        }
    }
};

export default transactionService;