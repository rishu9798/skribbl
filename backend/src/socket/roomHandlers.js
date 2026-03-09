import Room from '../models/Room.js';
import constants from '../config/constants.js';

const { EVENTS, ROOM_STATUS } = constants;

export default ({ io, socket, activeGames, disconnecting }) => {

  // Handle unexpected disconnect 
  if (disconnecting) {
    socket.on('disconnecting', async () => {
      for (const roomCode of socket.rooms) {
        if (roomCode === socket.id) continue;
        await handlePlayerLeave(io, socket, activeGames, roomCode);
      }
    });
    return;
  }

  // join-room
  socket.on(EVENTS.JOIN_ROOM, async ({ roomCode, password } = {}) => {
    try {
      if (!roomCode) {
        return socket.emit(EVENTS.ERROR, { message: 'Room code required' });
      }

      roomCode = roomCode.toUpperCase();

      const room = await Room.findOne({ code: roomCode });

      if (!room) {
        return socket.emit(EVENTS.ERROR, { message: 'Room not found' });
      }

      if (room.status === ROOM_STATUS.FINISHED) {
        return socket.emit(EVENTS.ERROR, { message: 'Game has ended' });
      }

      const onlinePlayers = room.players.filter(p => p.isOnline);

      if (
        onlinePlayers.length >= room.settings.maxPlayers &&
        !room.players.find(p => p.socketId === socket.id)
      ) {
        return socket.emit(EVENTS.ERROR, { message: 'Room is full' });
      }

      if (
        room.settings.isPrivate &&
        room.settings.password &&
        room.settings.password !== password
      ) {
        return socket.emit(EVENTS.ERROR, { message: 'Incorrect room password' });
      }

      // Leave all previous rooms first (IMPORTANT FIX) 
      for (const r of socket.rooms) {
        if (r !== socket.id) {
          socket.leave(r);
        }
      }

      //Check if player is reconnecting
     const existingPlayer = room.players.find(
        p => p.username === socket.user.username
      );

      const isHost = onlinePlayers.length === 0 && !existingPlayer;

      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.isOnline = true;
      } else {
        room.players.push({
          socketId: socket.id,
          userId: socket.user.id || null,
          username: socket.user.username,
          avatar: {
            color: randomColor(),
            emoji: randomEmoji(),
          },
          score: 0,
          isHost: isHost,
          isOnline: true,
        });

        if (isHost) {
          room.hostSocketId = socket.id;
        }
      }

      await room.save();

      // Join the new room 
      socket.join(roomCode);
      socket.roomCode = roomCode;

      // Send room state to the joining player
      socket.emit(EVENTS.ROOM_UPDATED, serializeRoom(room));

      // Notify other players
      socket.to(roomCode).emit(EVENTS.PLAYER_JOINED, {
        player: room.players.find(p => p.socketId === socket.id),
      });

      // Sync game state if game already running
      if (activeGames.has(roomCode)) {
        const gs = activeGames.get(roomCode);

        socket.emit('game-state-sync', {
          currentWord:
            gs.currentDrawerSocketId === socket.id
              ? gs.currentWord
              : undefined,
          hint: gs.hint,
          timeLeft: gs.timeLeft,
          drawerId: gs.currentDrawerSocketId,
          round: gs.currentRound,
          totalRounds: gs.totalRounds,
        });
      }

      console.log(`👤 ${socket.user.username} joined room ${roomCode}`);
    } catch (err) {
      console.error('join-room error:', err);
      socket.emit(EVENTS.ERROR, { message: 'Failed to join room' });
    }
  });

  // leave-room 
  socket.on(EVENTS.LEAVE_ROOM, async ({ roomCode }) => {
    await handlePlayerLeave(io, socket, activeGames, roomCode);

    socket.leave(roomCode);

    if (socket.roomCode === roomCode) {
      socket.roomCode = null;
    }
  });

  // kick-player 
  socket.on(EVENTS.KICK_PLAYER, async ({ roomCode, targetSocketId }) => {
    try {
      const room = await Room.findOne({ code: roomCode });

      if (!room) return;

      const kicker = room.players.find(p => p.socketId === socket.id);

      if (!kicker?.isHost) {
        return socket.emit(EVENTS.ERROR, {
          message: 'Only the host can kick players',
        });
      }

      const target = io.sockets.sockets.get(targetSocketId);

      if (target) {
        target.emit(EVENTS.ERROR, {
          message: 'You were kicked from the room',
        });

        target.leave(roomCode);
        target.roomCode = null;
      }

      room.players = room.players.filter(
        p => p.socketId !== targetSocketId
      );

      await room.save();

      io.to(roomCode).emit(EVENTS.ROOM_UPDATED, serializeRoom(room));
    } catch (err) {
      console.error('kick-player error:', err);
    }
  });
};


// Helpers 

async function handlePlayerLeave(io, socket, activeGames, roomCode) {
  try {
    const room = await Room.findOne({ code: roomCode });

    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);

    if (!player) return;

    player.isOnline = false;

    const onlinePlayers = room.players.filter(p => p.isOnline);

    // Reassign host if needed
    if (player.isHost && onlinePlayers.length > 0) {
      onlinePlayers[0].isHost = true;
      room.hostSocketId = onlinePlayers[0].socketId;
    }

    // Delete empty room
    if (onlinePlayers.length === 0) {
      await room.deleteOne();
      activeGames.delete(roomCode);
      return;
    }

    await room.save();

    io.to(roomCode).emit(EVENTS.PLAYER_LEFT, {
      playerId: player._id,
      socketId: socket.id,
    });

    io.to(roomCode).emit(EVENTS.ROOM_UPDATED, serializeRoom(room));

    console.log(`👋 ${socket.user.username} left room ${roomCode}`);
  } catch (err) {
    console.error('leave-room error:', err);
  }
}


function serializeRoom(room) {
  return {
    code: room.code,
    name: room.name,
    status: room.status,
    settings: room.settings,
    players: room.players
      .filter(p => p.isOnline)
      .map(p => ({
        id: p._id,
        socketId: p.socketId,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        isHost: p.isHost,
        hasGuessedThisTurn: p.hasGuessedThisTurn,
      })),
  };
}


const COLORS = [
  '#ff6b6b',
  '#ffd93d',
  '#6bcb77',
  '#4d96ff',
  '#f77f00',
  '#a8dadc',
  '#c77dff',
];

const EMOJIS = [
  '🎨',
  '🐱',
  '🐶',
  '🦊',
  '🐸',
  '🐼',
  '🐻',
  '🦁',
  '🐯',
  '🦊',
];

const randomColor = () =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

const randomEmoji = () =>
  EMOJIS[Math.floor(Math.random() * EMOJIS.length)];