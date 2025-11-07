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
            user: req.user._id,
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

// @desc    Get all transactions for a user with optional filtering
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
    try {
        const { type, category, startDate, endDate, search } = req.query;
        
        // Build filter object
        let filter = { user: req.user._id };
        
        // Filter by type
        if (type && type !== 'all') {
            filter.type = type;
        }
        
        // Filter by category
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        // Filter by date range
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        
        // Search in description
        if (search) {
            filter.description = { $regex: search, $options: 'i' }; // case-insensitive
        }

        const transactions = await Transaction.find(filter).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a summary of all transactions for the user with optional filtering
// @route   GET /api/transactions/summary
const getTransactionSummary = async (req, res) => {
    try {
        const { type, category, startDate, endDate, search } = req.query;
        
        // Build filter object (same as getTransactions)
        let filter = { user: req.user._id };
        
        if (type && type !== 'all') {
            filter.type = type;
        }
        
        if (category && category !== 'all') {
            filter.category = category;
        }
        
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }
        
        if (search) {
            filter.description = { $regex: search, $options: 'i' };
        }

        const transactions = await Transaction.find(filter);

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, transaction) => acc + transaction.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, transaction) => acc + transaction.amount, 0);
        
        const netProfitLoss = totalIncome - totalExpenses;

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
            filteredTransactionCount: transactions.length // Add count for reference
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
    try {
        const { type, category, amount, date, description } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if transaction belongs to the logged-in user
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this transaction' });
        }

        // Update fields
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.amount = amount || transaction.amount;
        transaction.date = date || transaction.date;
        transaction.description = description || transaction.description;

        const updatedTransaction = await transaction.save();
        res.json(updatedTransaction);

    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if transaction belongs to the logged-in user
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this transaction' });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction removed successfully' });

    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const parseSmsAndCreateTransactions = async (req, res) => {
    const { text } = req.body;
    const user = req.user._id;

    // Regular Expression to find M-Pesa "Sent" or "Paid to" transactions
    // Example: QABC... Confirmed. Ksh1,500.00 sent to JOHN DOE 07... on 28/10/25 at 7:30 PM.
    // Example: QABC... Confirmed. You have paid Ksh550.00 to KPLC PREPAID... on 28/10/25 at 8:00 PM.
    const mpesaRegex = /[A-Z0-9]{10}\sConfirmed\.\s(?:Ksh|KSh)([\d,]+\.\d{2})\s(?:sent to|paid to|you have paid)\s(.+?)\son\s(\d{1,2}\/\d{1,2}\/\d{2,4})\sat\s(\d{1,2}:\d{2}\s[AP]M)/g;
    
    const lines = text.split('\n');
    const transactionsToCreate = [];
    
    for (const line of lines) {
        // We use .exec in a loop to handle multiple matches in a single line if needed
        let match;
        while ((match = mpesaRegex.exec(line)) !== null) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            const description = match[2].trim();
            
            // Basic date parsing (Note: This assumes the current century)
            const dateParts = match[3].split('/');
            const timeParts = match[4].match(/(\d+):(\d+)\s(AM|PM)/);
            let hours = parseInt(timeParts[1]);
            if (timeParts[3] === 'PM' && hours !== 12) hours += 12;
            if (timeParts[3] === 'AM' && hours === 12) hours = 0;
            
            const year = parseInt(dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2]);
            const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
            const day = parseInt(dateParts[0]);
            const minutes = parseInt(timeParts[2]);

            const date = new Date(year, month, day, hours, minutes);

            transactionsToCreate.push({
                user,
                type: 'expense', // We assume sent/paid is an expense
                category: 'Other', // User can recategorize later
                amount,
                date,
                description,
            });
        }
    }

    if (transactionsToCreate.length > 0) {
        const createdTransactions = await Transaction.insertMany(transactionsToCreate);
        res.status(201).json({ message: `${createdTransactions.length} transactions created successfully.`, transactions: createdTransactions });
    } else {
        res.status(200).json({ message: 'No valid M-Pesa transactions found to import.' });
    }
};

module.exports = { 
    addTransaction, 
    getTransactions, 
    getTransactionSummary,
    updateTransaction,
    deleteTransaction,
    parseSmsAndCreateTransactions
};