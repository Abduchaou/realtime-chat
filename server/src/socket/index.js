const socketAuth = require('./middleware/socketAuth');
const messageHandler = require('./handlers/messageHandler');
const roomHandler = require('./handlers/roomHandler');
const typingHandler = require('./handlers/typingHandler');
const presenceHandler = require('./handlers/presenceHandler');

const setupSocketIO = (io) => {
  // Auth middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // Setup handlers
    roomHandler(io, socket);
    messageHandler(io, socket);
    typingHandler(io, socket);
    presenceHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      // Broadcast offline status
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });
};

module.exports = setupSocketIO;