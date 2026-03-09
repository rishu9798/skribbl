import { Server } from 'socket.io';
import { verifyToken } from '../utils/tokenUtils.js';
import dotenv from 'dotenv'
dotenv.config();
import roomHandlers from './roomHandlers.js';
import gameHandlers  from './gameHandlers.js';
import drawHandlers  from './drawHandlers.js';
import  chatHandlers  from './chatHandlers.js';

// In-memory active game state (rooms currently playing)
// Format: { [roomCode]: GameState }
const activeGames = new Map();

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ,
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  //Optional auth middleware 
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.slice(7);
    if (token) {
      try {
        socket.user = verifyToken(token);
      } catch (_) {
        // Invalid token  allow as anonymous (username from handshake)
        socket.user = { id: null, username: socket.handshake.auth?.username || 'Guest', isGuest: true };
      }
    } else {
      socket.user = { id: null, username: socket.handshake.auth?.username || 'Guest', isGuest: true };
    }
    next();
  });

  // Connection 
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (${socket.user.username})`);

    // Pass io and activeGames into each handler group
    const ctx = { io, socket, activeGames };

    roomHandlers(ctx);
    gameHandlers(ctx);
    drawHandlers(ctx);
    chatHandlers(ctx);

    socket.on('disconnect', (reason) => {
      console.log(` Socket disconnected: ${socket.id} — ${reason}`);
      roomHandlers({ ...ctx, disconnecting: true });
    });
  });

  return io;
};

export default initSocket;
