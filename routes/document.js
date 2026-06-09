const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', documentController.handleDocAll);
router.get('/NameImg', documentController.handleDocImgName);
router.post('/create', upload.single('img'), documentController.handleDocPost);
router.delete('/delete', documentController.handleDocDelete);
router.get('/:id', documentController.handleDocId);


module.exports = router;