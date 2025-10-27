const Transaction = require('../models/transactionModel');

// @desc    Add a new transaction
// @route   POST /api/transactions
const addTransaction = async (req, res) => {
    const { type, category, amount, date, description } = req.body;

    if (!type || !amount || !date || !description) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const transaction = new Transaction({
        user: req.user._id, // from protect middleware
        type,
        category,
        amount,
        date,
        description,
    });

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
};

// @desc    Get a summary of transactions for the dashboard
// @route   GET /api/transactions/summary
const getDashboardSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id });

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
        
        const netCashflow = totalIncome - totalExpenses;

        res.json({
            totalIncome,
            totalExpenses,
            netCashflow,
            transactionsCount: transactions.length,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { addTransaction, getTransactions, getDashboardSummary };