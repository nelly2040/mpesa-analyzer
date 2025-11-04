const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// ONLY ONE import statement for transactionController
const {
    addTransaction,
    getTransactions,
    getTransactionSummary,
    parseSmsAndCreateTransactions // Include all functions you need here
} = require('../controllers/transactionController');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

router.get('/summary', protect, getTransactionSummary);
router.post('/parse-sms', protect, parseSmsAndCreateTransactions);

module.exports = router;