const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createConversation,
  getMyConversations,
  joinConversation,
  getMembers,
  discoverRooms
} = require('../controllers/conversationController');

router.use(authMiddleware);

router.post('/', createConversation);
router.get('/', getMyConversations);
router.get('/discover', discoverRooms);
router.post('/:id/join', joinConversation);
router.get('/:id/members', getMembers);

module.exports = router;