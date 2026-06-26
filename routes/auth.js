const express = require('express');
const router = express.Router();
const { handleRegister } = require('../controllers/registerController.js');
const { handleLogin } = require('../controllers/loginController.js');
const { handleUserGet } = require('../controllers/userGetController.js');
const uploadEngine = require('../middleware/multer.js')


// Register Route
router.post('/register', uploadEngine.single('avatar'), handleRegister);

// Login Route
router.post('/login', handleLogin);

// get user
router.get('/:id', handleUserGet);

module.exports = router;