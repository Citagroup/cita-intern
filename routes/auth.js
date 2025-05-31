const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// Beispielroute zur Registrierung eines Users
router.post('/register', registerUser);

module.exports = router;
