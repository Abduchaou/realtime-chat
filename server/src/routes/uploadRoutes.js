const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadFile } = require('../controllers/uploadController');

router.use(authMiddleware);

router.post('/', upload.single('file'), uploadFile);

module.exports = router;