const { verifyToken } = require('../../utils/jwt');
const prisma = require('../../config/database');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, status: true }
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user data to socket
    socket.userId = user.id;
    socket.username = user.username;
    
    next();
  } catch (error) {
    next(new Error('Invalid or expired token'));
  }
};

module.exports = socketAuth;