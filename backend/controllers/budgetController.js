const Budget = require('../models/budgetModel');

// @desc    Create or update a budget
// @route   POST /api/budgets
const setBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;

        if (!category || !amount || !month || !year) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Validate month format (YYYY-MM)
        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
        }

        // Check if budget already exists for this category and month
        const existingBudget = await Budget.findOne({
            user: req.user._id,
            category,
            month
        });

        let budget;
        if (existingBudget) {
            // Update existing budget
            existingBudget.amount = amount;
            budget = await existingBudget.save();
        } else {
            // Create new budget
            budget = await Budget.create({
                user: req.user._id,
                category,
                amount,
                month,
                year
            });
        }

        res.status(201).json(budget);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Budget already exists for this category and month' });
        }
        console.error('Set budget error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all budgets for a user
// @route   GET /api/budgets
const getBudgets = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        let filter = { user: req.user._id };
        
        if (month) {
            filter.month = month;
        }
        
        if (year) {
            filter.year = parseInt(year);
        }

        const budgets = await Budget.find(filter).sort({ category: 1 });
        res.json(budgets);
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get budget summary with spending vs budget
// @route   GET /api/budgets/summary
const getBudgetSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        const Transaction = require('../models/transactionModel');
        
        // Get current month and year if not provided
        const currentDate = new Date();
        const targetMonth = month || currentDate.toISOString().slice(0, 7); // YYYY-MM
        const targetYear = year || currentDate.getFullYear();

        // Get budgets for the target month
        const budgets = await Budget.find({
            user: req.user._id,
            month: targetMonth
        });

        // Get transactions for the target month
        const startDate = new Date(targetYear, parseInt(targetMonth.split('-')[1]) - 1, 1);
        const endDate = new Date(targetYear, parseInt(targetMonth.split('-')[1]), 0, 23, 59, 59);

        const transactions = await Transaction.find({
            user: req.user._id,
            date: {
                $gte: startDate,
                $lte: endDate
            },
            type: 'expense' // Only expenses count against budgets
        });

        // Calculate spending by category
        const spendingByCategory = transactions.reduce((acc, transaction) => {
            const { category, amount } = transaction;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
            return acc;
        }, {});

        // Combine budget and spending data
        const budgetSummary = budgets.map(budget => {
            const spent = spendingByCategory[budget.category] || 0;
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;

            return {
                category: budget.category,
                budget: budget.amount,
                spent: spent,
                remaining: remaining,
                percentage: percentage,
                status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
            };
        });

        // Add categories that have spending but no budget
        Object.keys(spendingByCategory).forEach(category => {
            if (!budgets.find(b => b.category === category)) {
                budgetSummary.push({
                    category: category,
                    budget: 0,
                    spent: spendingByCategory[category],
                    remaining: -spendingByCategory[category],
                    percentage: 0,
                    status: 'no-budget'
                });
            }
        });

        res.json({
            month: targetMonth,
            year: targetYear,
            summary: budgetSummary,
            totalBudget: budgets.reduce((sum, budget) => sum + budget.amount, 0),
            totalSpent: Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0)
        });
    } catch (error) {
        console.error('Get budget summary error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this budget' });
        }

        await Budget.findByIdAndDelete(req.params.id);
        res.json({ message: 'Budget removed successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    setBudget,
    getBudgets,
    getBudgetSummary,
    deleteBudget
};