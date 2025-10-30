import API from './api';

const addTransaction = async (transactionData) => {
    const response = await API.post('/transactions', transactionData);
    return response.data;
};

const getTransactions = async () => {
    const response = await API.get('/transactions');
    return response.data;
};

const getSummary = async () => {
    const response = await API.get('/transactions/summary');
    return response.data;
};

const transactionService = {
    addTransaction,
    getTransactions,
};

export default transactionService;