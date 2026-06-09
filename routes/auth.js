const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const router = express.Router();
const upload = require('../middleware/upload.js');
const { handleRegister } = require('../controllers/registerController.js');
const { handleLogin } = require('../controllers/loginController.js');


// Register Route
router.post('/register', upload.single('avatar'), handleRegister);

// Login Route
router.post('/login', handleLogin);

module.exports = router;