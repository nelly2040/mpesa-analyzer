const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other', 'Salary', 'Sales', 'Gift']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    month: {
        type: String, // Format: "2024-01" for January 2024
        required: true
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Ensure one budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);