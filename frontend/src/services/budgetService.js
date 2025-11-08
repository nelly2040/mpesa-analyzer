import API from './api';

const BUDGET_API_URL = '/budgets';

const budgetService = {
    setBudget: async (budgetData) => {
        try {
            console.log('Sending budget data:', budgetData);
            
            // Check if we have a token
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('User token exists:', !!user?.token);
            
            const response = await API.post(BUDGET_API_URL, budgetData);
            console.log('Budget set successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error setting budget:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    },

    getBudgets: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.month) params.append('month', filters.month);
            if (filters.year) params.append('year', filters.year);

            const url = `${BUDGET_API_URL}?${params.toString()}`;
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching budgets:', error);
            throw error;
        }
    },

    getBudgetSummary: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.month) params.append('month', filters.month);
            if (filters.year) params.append('year', filters.year);

            const url = `${BUDGET_API_URL}/summary?${params.toString()}`;
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching budget summary:', error);
            throw error;
        }
    },

    deleteBudget: async (id) => {
        try {
            const response = await API.delete(`${BUDGET_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting budget:', error);
            throw error;
        }
    }
};

export default budgetService;