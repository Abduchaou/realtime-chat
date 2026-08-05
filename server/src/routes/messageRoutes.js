const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendMessage, getMessages, searchMessages } = require('../controllers/messageController');

router.use(authMiddleware);

router.post('/:id/messages', sendMessage);
router.get('/:id/messages', getMessages);
router.get('/:id/search', searchMessages);

module.exports = router;