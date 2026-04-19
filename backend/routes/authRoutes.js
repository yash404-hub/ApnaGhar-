const express = require('express');
const { loginUser, registerUser, changePassword } = require('../controllers/authController');
const { protect, ownerOnly } = require('../middleware/auth');
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', protect, ownerOnly, registerUser);
router.post('/change-password', protect, changePassword);

module.exports = router;
