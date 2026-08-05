const prisma = require('../../config/database');

const messageHandler = (io, socket) => {
  // Send a real-time message
  socket.on('send_message', async ({ conversationId, content, type, fileUrl }) => {
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

      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          type: type || 'text',
          fileUrl,
          conversationId,
          senderId: socket.userId
        },
        include: {
          sender: {
            select: { id: true, username: true, avatar: true }
          }
        }
      });

      // Update conversation's updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // Broadcast to all members in the room
      io.to(conversationId).emit('message_new', {
        message,
        conversationId
      });

      console.log(`Message sent in room ${conversationId} by ${socket.username}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};

module.exports = messageHandler;