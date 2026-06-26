const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/multer');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', documentController.handleDocAll);
router.post('/create', upload.single('img'), documentController.handleDocPost);
router.delete('/delete/:userId/:id', documentController.handleDocDelete);
router.get('/:id', documentController.handleDocId);


module.exports = router;