const typingHandler = (io, socket) => {
  // User started typing
  socket.on('typing_start', ({ conversationId }) => {
    socket.to(conversationId).emit('user_typing', {
      userId: socket.userId,
      username: socket.username,
      conversationId,
      isTyping: true
    });
  });

  // User stopped typing
  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(conversationId).emit('user_typing', {
      userId: socket.userId,
      username: socket.username,
      conversationId,
      isTyping: false
    });
  });
};

module.exports = typingHandler;