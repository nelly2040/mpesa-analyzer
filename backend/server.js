const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Route imports
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // This line must exist
const budgetRoutes = require('./routes/budgetRoutes');

// This line loads the variables from your .env file
dotenv.config();

// Connect to Database using the variable from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes); // This line must exist
app.use('/api/budgets', budgetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));