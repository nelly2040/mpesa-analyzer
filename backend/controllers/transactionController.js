const Transaction = require('../models/transactionModel');

// @desc    Add a new transaction
// @route   POST /api/transactions
const addTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, description } = req.body;

        if (!type || !category || !amount || !date || !description) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const transaction = new Transaction({
            user: req.user._id, // This comes from our 'protect' middleware
            type,
            category,
            amount,
            date,
            description,
        });

        const createdTransaction = await transaction.save();
        res.status(201).json(createdTransaction);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
const getTransactionSummary = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id });

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        
        const netProfitLoss = totalIncome - totalExpenses;

        // Group expenses by category for the chart
        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, transaction) => {
                const { category, amount } = transaction;
                if (!acc[category]) {
                    acc[category] = 0;
                }
                acc[category] += amount;
                return acc;
            }, {});

        res.json({
            totalIncome,
            totalExpenses,
            netProfitLoss,
            expenseByCategory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = { 
    addTransaction, 
    getTransactions, 
    getTransactionSummary // Add this
};