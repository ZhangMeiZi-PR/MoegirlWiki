const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const verifyJWT = require('../middleware/verifyJWT');
const uploadEngine = require('../middleware/multer');

//GET
router.get('/', blogController.handleBlogAll);
router.get('/recent', blogController.handleBlogRecent);
router.get('/:id', blogController.handleBlogId);
router.get('/profile/:userId', blogController.handleBlogUserId);

//verifyJWT POST
router.post('/create', blogController.handleBlogPost);
router.post('/upload', uploadEngine.single('image'), blogController.handleBlogImageUpload);
//verifyJWT DELETE
router.delete('/delete/:userId/:id', blogController.handleBlogDelete);



module.exports = router;