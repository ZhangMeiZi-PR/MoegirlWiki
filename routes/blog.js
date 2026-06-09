const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', blogController.handleBlogAll);
router.get('/recent', blogController.handleBlogRecent);
router.get('/:id', blogController.handleBlogId);
//verifyJWT POST
router.post('/create',blogController.handleBlogPost);
//


module.exports = router;