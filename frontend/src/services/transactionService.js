import API from './api';

const TRANSACTION_API_URL = '/transactions';

const transactionService = {
    addTransaction: async (transactionData) => {
        try {
            console.log('Sending transaction data:', transactionData);
            
            const response = await API.post(TRANSACTION_API_URL, transactionData);
            
            console.log('Transaction created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error adding transaction:', error);
            console.error('Error response:', error.response);
            throw error;
        }
    },

    getTransactions: async (filters = {}) => {
        try {
            const response = await API.get(TRANSACTION_API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    getSummary: async (filters = {}) => {
    try {
        // Build query parameters (same as getTransactions)
        const params = new URLSearchParams();
        
        if (filters.type && filters.type !== 'all') {
            params.append('type', filters.type);
        }
        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }
        if (filters.startDate) {
            params.append('startDate', filters.startDate);
        }
        if (filters.endDate) {
            params.append('endDate', filters.endDate);
        }
        if (filters.search) {
            params.append('search', filters.search);
        }

        const url = `${TRANSACTION_API_URL}/summary?${params.toString()}`;
        const response = await API.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching summary:', error);
        throw error;
    }
},

    updateTransaction: async (id, transactionData) => {
    try {
        console.log('Updating transaction:', id, transactionData);
        const response = await API.put(`${TRANSACTION_API_URL}/${id}`, transactionData);
        console.log('Transaction updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
},

    deleteTransaction: async (id) => {
    try {
        console.log('Deleting transaction:', id);
        const response = await API.delete(`${TRANSACTION_API_URL}/${id}`);
        console.log('Transaction deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
}
};

export default transactionService;