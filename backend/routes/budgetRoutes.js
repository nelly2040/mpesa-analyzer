const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    setBudget,
    getBudgets,
    getBudgetSummary,
    deleteBudget
} = require('../controllers/budgetController');

router.route('/')
    .post(protect, setBudget)
    .get(protect, getBudgets);

router.get('/summary', protect, getBudgetSummary);
router.delete('/:id', protect, deleteBudget);

module.exports = router;