const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions, getDashboardSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

router.route('/summary').get(protect, getDashboardSummary);

module.exports = router;