const prisma = require('../../config/database');

const roomHandler = (io, socket) => {
  // Join a conversation room
  socket.on('join_conversation', async ({ conversationId }) => {
    try {
      // Verify membership
      const membership = await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId: socket.userId
        }
      });

      if (!membership) {
        return socket.emit('error', { message: 'Not a member of this conversation' });
      }

      socket.join(conversationId);
      console.log(`User ${socket.username} joined room ${conversationId}`);

      socket.emit('joined_conversation', { conversationId });

      // Notify other members
      socket.to(conversationId).emit('user_joined', {
        userId: socket.userId,
        username: socket.username,
        conversationId
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Leave a conversation room
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
    console.log(`User ${socket.username} left room ${conversationId}`);
    
    socket.to(conversationId).emit('user_left', {
      userId: socket.userId,
      conversationId
    });
  });
};

module.exports = roomHandler;