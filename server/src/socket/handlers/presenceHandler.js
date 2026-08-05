const prisma = require('../../config/database');

const presenceHandler = (io, socket) => {
  // Update user status to online
  const updateStatus = async (status) => {
    try {
      await prisma.user.update({
        where: { id: socket.userId },
        data: { status, lastSeen: new Date() }
      });

      // Broadcast to all connected users
      io.emit('user_status_change', {
        userId: socket.userId,
        username: socket.username,
        status
      });
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  // Set online on connect
  updateStatus('online');

  // Handle status updates
  socket.on('status_update', ({ status }) => {
    updateStatus(status);
  });

  // Set away when inactive (client will trigger this)
  socket.on('away', () => {
    updateStatus('away');
  });
};

module.exports = presenceHandler;