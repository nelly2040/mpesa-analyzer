const express = require('express');
const router = express.Router();
// Import the new functions
const { 
    registerUser, 
    loginUser, 
    getUserProfile,
    updateUserProfile,
    changeUserPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile route - GET for fetching, PUT for updating
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Password change route
router.put('/password', protect, changeUserPassword);


module.exports = router;