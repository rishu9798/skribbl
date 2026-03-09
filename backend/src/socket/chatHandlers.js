
import Room from '../models/Room.js';
import constants from '../config/constants.js';
import { isCorrectGuess, calcGuesserScore } from '../utils/gameLogic.js';

const { EVENTS, TURN_STATUS } = constants;

export default ({ io, socket, activeGames }) => {

  socket.on(EVENTS.SEND_MESSAGE, async ({ roomCode, message }) => {
    if (!roomCode || !message?.trim()) return;

    const gs = activeGames.get(roomCode);
    const isInGame = !!gs;
    const isDrawer = isInGame && gs.currentDrawerSocketId === socket.id;

    //Guess check 
    if (isInGame && gs.turnStatus === TURN_STATUS.DRAWING && !isDrawer) {
      const alreadyGuessed = gs.guessedPlayers.has(socket.id);

      if (!alreadyGuessed && gs.currentWord && isCorrectGuess(message, gs.currentWord)) {
        // Correct guess!
        const timeTaken = gs.drawTime - gs.timeLeft;
        const points = calcGuesserScore(gs.timeLeft, gs.drawTime);

        gs.guessedPlayers.add(socket.id);
        gs.scores[socket.id] = (gs.scores[socket.id] || 0) + points;

        // Update room player score
        await Room.updateOne(
          { code: roomCode, 'players.socketId': socket.id },
          { $inc: { 'players.$.score': points }, $set: { 'players.$.hasGuessedThisTurn': true } }
        );

        // Notify everyone of correct guess 
        io.to(roomCode).emit(EVENTS.CORRECT_GUESS, {
          socketId: socket.id,
          username: socket.user.username,
          points,
          timeLeft: gs.timeLeft,
        });

        // correct guesed
        io.to(roomCode).emit(EVENTS.MESSAGE_RECEIVED, {
          type: 'correct',
          username: socket.user.username,
          message: '🎉 guessed the word!',
          timestamp: Date.now(),
        });

        // Check if ALL guessers guessed end turn early
        const room = await Room.findOne({ code: roomCode });
        const online = room?.players.filter(p => p.isOnline && p.socketId !== gs.currentDrawerSocketId) || [];
        if (gs.guessedPlayers.size >= online.length) {
          clearInterval(gs.timer);
          // Import dynamically to avoid circular deps
          const { endTurn } = require('./gameHandlers');
          await endTurn(io, activeGames, roomCode);
        }

        return; // Don't broadcast the actual guess text
      }

      // Close guess  reveal a hint letter
      if (!alreadyGuessed && gs.currentWord) {
        const closeThreshold = levenshtein(message.toLowerCase(), gs.currentWord.toLowerCase());
        if (closeThreshold <= 2) {
          socket.emit(EVENTS.MESSAGE_RECEIVED, {
            type: 'close',
            username: 'Hint',
            message: `"${message}" is close!`,
            timestamp: Date.now(),
          });
          return;
        }
      }

      // Regular message if player already guessed, only show to those who guessed
      if (alreadyGuessed) {
        // Only visible to already-guessed players and drawer
        const room = await Room.findOne({ code: roomCode });
        const targets = [gs.currentDrawerSocketId, ...[...gs.guessedPlayers]];
        targets.forEach(sid => {
          io.to(sid).emit(EVENTS.MESSAGE_RECEIVED, {
            type: 'chat',
            username: socket.user.username,
            message: message.trim(),
            timestamp: Date.now(),
            guessedOnly: true,
          });
        });
        return;
      }
    }

    // Regular chat message 
    // If drawer is in game, prevent revealing word via chat
    if (isDrawer && gs.currentWord) {
      // Filter message — replace word occurrences with 
      const sanitized = message.replace(new RegExp(gs.currentWord, 'gi'), '****');
      io.to(roomCode).emit(EVENTS.MESSAGE_RECEIVED, {
        type: 'chat',
        username: socket.user.username,
        message: sanitized.trim(),
        timestamp: Date.now(),
      });
      return;
    }

    // Broadcast to everyone
    io.to(roomCode).emit(EVENTS.MESSAGE_RECEIVED, {
      type: 'chat',
      username: socket.user.username,
      message: message.trim().slice(0, 200),
      timestamp: Date.now(),
    });
  });
};

// Simple Levenshtein distance for close guess detection
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[a.length][b.length];
}
