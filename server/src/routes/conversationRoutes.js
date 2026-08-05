const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createConversation,
  getMyConversations,
  joinConversation,
  getMembers
} = require('../controllers/conversationController');

router.use(authMiddleware);

router.post('/', createConversation);
router.get('/', getMyConversations);
router.post('/:id/join', joinConversation);
router.get('/:id/members', getMembers);

module.exports = router;