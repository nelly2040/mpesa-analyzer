const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// ONLY ONE import statement for transactionController
const {
    addTransaction,
    getTransactions,
    getTransactionSummary,
    updateTransaction,    // Add this import
    deleteTransaction,    // Add this import
    parseSmsAndCreateTransactions
} = require('../controllers/transactionController');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

router.get('/summary', protect, getTransactionSummary);
router.post('/parse-sms', protect, parseSmsAndCreateTransactions);

// Add these new routes for update and delete
router.route('/:id')
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

module.exports = router;