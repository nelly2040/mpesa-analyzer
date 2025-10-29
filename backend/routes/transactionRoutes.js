const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Both routes are protected. You must be logged in.
router.route('/')
    .post(protect, addTransaction)
    .get(protect, getTransactions);

module.exports = router;