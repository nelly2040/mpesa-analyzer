const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
    addTransaction,
    getTransactions,
    getTransactionSummary,
    updateTransaction,
    deleteTransaction,
    parseSmsAndCreateTransactions,
    getMonthlyReport,
    getYearlyReport,
    autoCategorizeTransactions  // ADD THIS
} = require('../controllers/transactionController');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

router.get('/summary', protect, getTransactionSummary);
router.post('/parse-sms', protect, parseSmsAndCreateTransactions);
router.post('/auto-categorize', protect, autoCategorizeTransactions); // ADD THIS

router.get('/reports/monthly', protect, getMonthlyReport);
router.get('/reports/yearly', protect, getYearlyReport);

router.route('/:id')
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

module.exports = router;