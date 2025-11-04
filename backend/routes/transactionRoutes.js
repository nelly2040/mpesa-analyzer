const express = require('express');
const router = express.Router();

const { addTransaction, getTransactions, getTransactionSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { 
    addTransaction, 
    getTransactions, 
    getTransactionSummary,
    parseSmsAndCreateTransactions // Import new function
} = require('../controllers/transactionController');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

// Add this new route for the summary
router.get('/summary', protect, getTransactionSummary);
router.post('/parse-sms', protect, parseSmsAndCreateTransactions);
module.exports = router;