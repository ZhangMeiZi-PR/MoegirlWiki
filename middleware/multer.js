const multer = require('multer');
const path = require('path');


// multer middleware
const fileStorage = multer.memoryStorage();
const uploadEngine = multer({storage: fileStorage});

module.exports = uploadEngine;