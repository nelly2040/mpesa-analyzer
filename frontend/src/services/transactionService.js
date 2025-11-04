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

const parseSms = async (text) => {
    const response = await API.post('/transactions/parse-sms', { text });
    return response.data;
};

// Ensure all three functions are listed here
const transactionService = {
    addTransaction,
    getTransactions,
    getSummary,
    parseSms,
};


export default transactionService;