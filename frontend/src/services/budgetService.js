import API from './api';

const BUDGET_API_URL = '/budgets';

const budgetService = {
    // Set or update a budget
    setBudget: async (budgetData) => {
        try {
            const response = await API.post(BUDGET_API_URL, budgetData);
            return response.data;
        } catch (error) {
            console.error('Error setting budget:', error);
            throw error;
        }
    },

    // Get all budgets
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

    // Get budget summary with spending
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

    // Delete a budget
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