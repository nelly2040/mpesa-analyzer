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
            filteredTransactionCount: transactions.length
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

// @desc    Parse M-Pesa SMS and create transactions with smart categorization
// @route   POST /api/transactions/parse-sms
const parseSmsAndCreateTransactions = async (req, res) => {
    try {
        const { text } = req.body;
        const user = req.user._id;

        // Enhanced M-Pesa patterns with smart categorization
        const mpesaPatterns = [
            // Sent money patterns
            {
                regex: /([A-Z0-9]{10})\sConfirmed\.\s(?:Ksh|KSh)([\d,]+\.\d{2})\ssent to\s(.+?)\s(\d+)\son\s(\d{1,2}\/\d{1,2}\/\d{2,4})\sat\s(\d{1,2}:\d{2}\s[AP]M)/,
                type: 'expense',
                getCategory: (description) => categorizeTransaction(description, 'sent')
            },
            // Paid to businesses patterns
            {
                regex: /([A-Z0-9]{10})\sConfirmed\.\s(?:Ksh|KSh)([\d,]+\.\d{2})\spaid to\s(.+?)\son\s(\d{1,2}\/\d{1,2}\/\d{2,4})\sat\s(\d{1,2}:\d{2}\s[AP]M)/,
                type: 'expense', 
                getCategory: (description) => categorizeTransaction(description, 'paid')
            },
            // You have paid patterns
            {
                regex: /([A-Z0-9]{10})\sConfirmed\.\sYou have paid\s(?:Ksh|KSh)([\d,]+\.\d{2})\sto\s(.+?)\son\s(\d{1,2}\/\d{1,2}\/\d{2,4})\sat\s(\d{1,2}:\d{2}\s[AP]M)/,
                type: 'expense',
                getCategory: (description) => categorizeTransaction(description, 'paid')
            },
            // Received money patterns
            {
                regex: /([A-Z0-9]{10})\sConfirmed\.\s(?:Ksh|KSh)([\d,]+\.\d{2})\sreceived from\s(.+?)\s(\d+)\son\s(\d{1,2}\/\d{1,2}\/\d{2,4})\sat\s(\d{1,2}:\d{2}\s[AP]M)/,
                type: 'income',
                getCategory: () => 'Gift'
            },
            // Business payment received
            {
                regex: /([A-Z0-9]{10})\sConfirmed\.\s(?:Ksh|KSh)([\d,]+\.\d{2})\sreceived from\s(.+?)\son\s(\d{1,2}\/\d{1,2}\/\d{2,4})\sat\s(\d{1,2}:\d{2}\s[AP]M)/,
                type: 'income',
                getCategory: (description) => categorizeTransaction(description, 'business')
            }
        ];

        // Smart categorization function
        const categorizeTransaction = (description, transactionType) => {
            const desc = description.toLowerCase();
            
            // Food & Dining
            if (desc.includes('naivas') || desc.includes('nakumatt') || desc.includes('tuskys') || 
                desc.includes('chandarana') || desc.includes('food') || desc.includes('restaurant') ||
                desc.includes('kfc') || desc.includes('java') || desc.includes('mcdonalds')) {
                return 'Food';
            }
            
            // Transport
            if (desc.includes('uber') || desc.includes('bolt') || desc.includes('taxi') || 
                desc.includes('matatu') || desc.includes('bus') || desc.includes('fuel') ||
                desc.includes('shell') || desc.includes('total') || desc.includes('mobil')) {
                return 'Transport';
            }
            
            // Utilities
            if (desc.includes('kplc') || desc.includes('electricity') || desc.includes('nairobi water') ||
                desc.includes('water') || desc.includes('airtel') || desc.includes('safaricom') ||
                desc.includes('telkom') || desc.includes('internet') || desc.includes('wi-fi')) {
                return 'Utilities';
            }
            
            // Entertainment
            if (desc.includes('netflix') || desc.includes('showmax') || desc.includes('movie') ||
                desc.includes('cinema') || desc.includes('spotify') || desc.includes('youtube') ||
                desc.includes('game') || desc.includes('entertainment')) {
                return 'Entertainment';
            }
            
            // Shopping
            if (desc.includes('jumia') || desc.includes('konga') || desc.includes('shop') ||
                desc.includes('market') || desc.includes('mall') || desc.includes('clothes') ||
                desc.includes('fashion')) {
                return 'Shopping';
            }
            
            // Salary & Business (for income)
            if (transactionType === 'business' || desc.includes('salary') || desc.includes('payroll') ||
                desc.includes('payment') || desc.includes('invoice')) {
                return 'Salary';
            }
            
            // Default categories based on transaction type
            if (transactionType === 'sent') return 'Other';
            if (transactionType === 'paid') return 'Utilities';
            if (transactionType === 'business') return 'Sales';
            
            return 'Other';
        };

        const lines = text.split('\n');
        const transactionsToCreate = [];
        const skippedTransactions = [];
        
        for (const line of lines) {
            let transactionCreated = false;
            
            for (const pattern of mpesaPatterns) {
                const match = line.match(pattern.regex);
                if (match) {
                    const amount = parseFloat(match[2].replace(/,/g, ''));
                    const description = match[3].trim();
                    
                    // Parse date and time
                    const dateParts = match[4]?.split('/') || match[5]?.split('/');
                    const timeParts = (match[6] || match[5])?.match(/(\d+):(\d+)\s(AM|PM)/);
                    
                    if (!dateParts || !timeParts) {
                        skippedTransactions.push({ line, reason: 'Invalid date format' });
                        continue;
                    }
                    
                    let hours = parseInt(timeParts[1]);
                    if (timeParts[3] === 'PM' && hours !== 12) hours += 12;
                    if (timeParts[3] === 'AM' && hours === 12) hours = 0;
                    
                    const year = parseInt(dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2]);
                    const month = parseInt(dateParts[1]) - 1;
                    const day = parseInt(dateParts[0]);
                    const minutes = parseInt(timeParts[2]);

                    const date = new Date(year, month, day, hours, minutes);
                    
                    // Get smart category
                    const category = pattern.getCategory(description);

                    transactionsToCreate.push({
                        user,
                        type: pattern.type,
                        category,
                        amount,
                        date,
                        description: `${description} (Auto-categorized)`,
                        mpesaCode: match[1]
                    });
                    
                    transactionCreated = true;
                    break;
                }
            }
            
            if (!transactionCreated && line.trim() && line.includes('MPesa') || line.includes('Ksh')) {
                skippedTransactions.push({ line, reason: 'Pattern not recognized' });
            }
        }

        if (transactionsToCreate.length > 0) {
            const createdTransactions = await Transaction.insertMany(transactionsToCreate);
            
            res.status(201).json({ 
                message: `${createdTransactions.length} transactions created successfully.`,
                transactions: createdTransactions,
                skipped: skippedTransactions,
                summary: {
                    income: createdTransactions.filter(t => t.type === 'income').length,
                    expenses: createdTransactions.filter(t => t.type === 'expense').length,
                    categories: [...new Set(createdTransactions.map(t => t.category))]
                }
            });
        } else {
            res.status(200).json({ 
                message: 'No valid M-Pesa transactions found to import.',
                skipped: skippedTransactions
            });
        }
    } catch (error) {
        console.error('Parse SMS error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auto-categorize existing transactions
// @route   POST /api/transactions/auto-categorize
const autoCategorizeTransactions = async (req, res) => {
    try {
        console.log('✅ Auto-categorize endpoint called!');
        
        const { transactionIds } = req.body;
        
        // Simple test response
        res.json({
            message: "Auto-categorize is working!",
            updatedCount: 3,
            totalTransactions: 5,
            testUpdates: [
                { description: "Test transaction 1", oldCategory: "Other", newCategory: "Food" },
                { description: "Test transaction 2", oldCategory: "Other", newCategory: "Transport" }
            ]
        });
    } catch (error) {
        console.error('Auto-categorize error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get monthly report
// @route   GET /api/transactions/reports/monthly
const getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.query;
        
        // Use current month/year if not provided
        const currentDate = new Date();
        const targetYear = parseInt(year) || currentDate.getFullYear();
        const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
        
        // Calculate date range for the month
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Get transactions for the month
        const transactions = await Transaction.find({
            user: req.user._id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: -1 });

        // Calculate totals
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netProfitLoss = totalIncome - totalExpenses;

        // Group by category
        const incomeByCategory = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        // Daily breakdown
        const dailyBreakdown = transactions.reduce((acc, t) => {
            const dateStr = t.date.toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = { income: 0, expenses: 0, transactions: [] };
            }
            if (t.type === 'income') {
                acc[dateStr].income += t.amount;
            } else {
                acc[dateStr].expenses += t.amount;
            }
            acc[dateStr].transactions.push(t);
            return acc;
        }, {});

        res.json({
            period: {
                year: targetYear,
                month: targetMonth,
                monthName: new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' })
            },
            summary: {
                totalIncome,
                totalExpenses,
                netProfitLoss,
                transactionCount: transactions.length
            },
            incomeByCategory,
            expenseByCategory,
            dailyBreakdown,
            transactions
        });
    } catch (error) {
        console.error('Monthly report error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get yearly report
// @route   GET /api/transactions/reports/yearly
const getYearlyReport = async (req, res) => {
    try {
        const { year } = req.query;
        
        // Use current year if not provided
        const currentDate = new Date();
        const targetYear = parseInt(year) || currentDate.getFullYear();
        
        // Calculate date range for the year
        const startDate = new Date(targetYear, 0, 1);
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

        // Get transactions for the year
        const transactions = await Transaction.find({
            user: req.user._id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Monthly breakdown
        const monthlyBreakdown = {};
        for (let month = 0; month < 12; month++) {
            const monthTransactions = transactions.filter(t => 
                t.date.getMonth() === month
            );
            
            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            monthlyBreakdown[month] = {
                income,
                expenses,
                net: income - expenses,
                transactionCount: monthTransactions.length,
                monthName: new Date(targetYear, month).toLocaleString('default', { month: 'short' })
            };
        }

        // Yearly totals
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Category breakdown for the year
        const incomeByCategory = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        res.json({
            period: {
                year: targetYear
            },
            summary: {
                totalIncome,
                totalExpenses,
                netProfitLoss: totalIncome - totalExpenses,
                transactionCount: transactions.length,
                averageMonthlyIncome: totalIncome / 12,
                averageMonthlyExpenses: totalExpenses / 12
            },
            monthlyBreakdown,
            incomeByCategory,
            expenseByCategory,
            topCategories: {
                income: Object.entries(incomeByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5),
                expenses: Object.entries(expenseByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
            }
        });
    } catch (error) {
        console.error('Yearly report error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
    addTransaction, 
    getTransactions, 
    getTransactionSummary,
    updateTransaction,
    deleteTransaction,
    parseSmsAndCreateTransactions,
    getMonthlyReport,  
    getYearlyReport,
    autoCategorizeTransactions    
};