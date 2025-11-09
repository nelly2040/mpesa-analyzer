import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    setBudget,
    getBudgets,
    getBudgetSummary,
    deleteBudget
} from '../controllers/budgetController.js';

router.route('/')
    .post(protect, setBudget)
    .get(protect, getBudgets);

router.get('/summary', protect, getBudgetSummary);
router.delete('/:id', protect, deleteBudget);

export default router;