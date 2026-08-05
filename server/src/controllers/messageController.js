const prisma = require('../config/database');

// Send a message
const sendMessage = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const { content, type, fileUrl } = req.body;

    // Check if user is member
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member of this conversation' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        type: type || 'text',
        fileUrl,
        conversationId,
        senderId: req.userId
      },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

// Get messages with pagination (for infinite scroll)
const getMessages = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const { cursor, limit = 20 } = req.query;

    // Check membership
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: parseInt(limit) + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });

    let nextCursor = null;
    if (messages.length > limit) {
      nextCursor = messages[limit].id;
      messages.pop();
    }

    res.status(200).json({
      success: true,
      data: {
        messages,
        nextCursor
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search messages
const searchMessages = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const { q } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        content: {
          contains: q,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: {
          select: { id: true, username: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, searchMessages };