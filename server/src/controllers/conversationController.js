const prisma = require('../config/database');

// Create a new room/channel
const createConversation = async (req, res, next) => {
  try {
    const { name, description, type, isPrivate } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        name,
        description,
        type: type || 'channel',
        isPrivate: isPrivate || false,
        createdById: req.userId,
        members: {
          create: {
            userId: req.userId,
            role: 'admin'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, status: true }
            }
          }
        },
        _count: {
          select: { members: true, messages: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

// Get all conversations user is part of
const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: req.userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, status: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { members: true, messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

// Join a conversation
const joinConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.isPrivate) {
      return res.status(403).json({ success: false, message: 'Cannot join private conversation' });
    }

    const membership = await prisma.conversationMember.create({
      data: {
        conversationId: id,
        userId: req.userId
      }
    });

    res.status(200).json({
      success: true,
      data: { membership }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Already a member' });
    }
    next(error);
  }
};

// Get conversation members
const getMembers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const members = await prisma.conversationMember.findMany({
      where: { conversationId: id },
      include: {
        user: {
          select: { id: true, username: true, status: true, lastSeen: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { members }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getMyConversations,
  joinConversation,
  getMembers
};