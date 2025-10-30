const express = require('express');
const router = express.Router();
// Make sure you import getTransactionSummary here
const { addTransaction, getTransactions, getTransactionSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

// Add this new route for the summary
router.get('/summary', protect, getTransactionSummary);

module.exports = router;