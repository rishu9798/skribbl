import Room  from '../models/Room.js';
import Game  from '../models/Game.js';
import constants from '../config/constants.js';
const { EVENTS, ROOM_STATUS, TURN_STATUS, MIN_PLAYERS } = constants;
import {
  pickWords, buildHint, getHintRevealCount,
  calcGuesserScore, rankPlayers, isCorrectGuess, DRAWER_SCORE_PER_GUESSER,
} from '../utils/gameLogic.js';

export default  ({ io, socket, activeGames }) => {

  // start-game 
  socket.on(EVENTS.START_GAME, async ({ roomCode }) => {
    try {
      const room = await Room.findOne({ code: roomCode });
      if (!room) return socket.emit(EVENTS.ERROR, { message: 'Room not found' });

      const hostPlayer = room.players.find(p => p.socketId === socket.id);
      if (!hostPlayer?.isHost) return socket.emit(EVENTS.ERROR, { message: 'Only host can start' });

      const online = room.players.filter(p => p.isOnline);
      if (online.length < MIN_PLAYERS) return socket.emit(EVENTS.ERROR, { message: `Need at least ${MIN_PLAYERS} players` });

      if (room.status === ROOM_STATUS.PLAYING) return socket.emit(EVENTS.ERROR, { message: 'Game already started' });

      // Reset scores
      room.players.forEach(p => { p.score = 0; });
      room.status = ROOM_STATUS.PLAYING;
      await room.save();

      // Create game record
      const drawerOrder = online.map(p => p.socketId);
      const game = await Game.create({
        room: room._id,
        totalRounds: room.settings.rounds,
        drawerOrder,
      });

      // Init in-memory game state
      const gameState = {
        gameId:               game._id,
        roomCode,
        totalRounds:          room.settings.rounds,
        currentRound:         1,
        drawTime:             room.settings.drawTime,
        customWords:          room.settings.customWords,
        useCustomOnly:        room.settings.useCustomOnly,
        drawerOrder,
        currentDrawerIndex:   0,
        currentDrawerSocketId: drawerOrder[0],
        currentWord:          null,
        hint:                 null,
        turnStatus:           TURN_STATUS.CHOOSING,
        timer:                null,
        hintTimer:            null,
        timeLeft:             room.settings.drawTime,
        guessedPlayers:       new Set(),
        scores:               Object.fromEntries(online.map(p => [p.socketId, p.score])),
      };
      activeGames.set(roomCode, gameState);

      io.to(roomCode).emit(EVENTS.GAME_STARTED, {
        gameId: game._id,
        totalRounds: game.totalRounds,
        players: online.map(p => ({ socketId: p.socketId, username: p.username, avatar: p.avatar, score: 0 })),
      });

      // Kick off first turn
      await startTurn(io, activeGames, roomCode, room.settings);
    } catch (err) {
      console.error('start-game error:', err);
      socket.emit(EVENTS.ERROR, { message: 'Failed to start game' });
    }
  });

  // word-chosen 
  socket.on(EVENTS.WORD_CHOSEN, async ({ roomCode, word }) => {
    try {
      const gs = activeGames.get(roomCode);
      if (!gs) return;
      if (gs.currentDrawerSocketId !== socket.id) return;
      if (gs.turnStatus !== TURN_STATUS.CHOOSING) return;

      gs.currentWord = word;
      gs.hint = buildHint(word, 0);
      gs.turnStatus = TURN_STATUS.DRAWING;
      gs.timeLeft = gs.drawTime;
      gs.turnStartedAt = Date.now();

      // Notify everyone turn is active
      io.to(roomCode).emit(EVENTS.TURN_STARTED, {
        drawerSocketId: socket.id,
        hint: gs.hint,
        wordLength: word.length,
        timeLeft: gs.timeLeft,
        round: gs.currentRound,
        totalRounds: gs.totalRounds,
      });

      // Countdown timer
      startTurnTimer(io, activeGames, roomCode);
    } catch (err) {
      console.error('word-chosen error:', err);
    }
  });
};

//Internal helpers

async function startTurn(io, activeGames, roomCode, settings) {
  const gs = activeGames.get(roomCode);
  if (!gs) return;

  gs.guessedPlayers = new Set();
  gs.currentWord    = null;
  gs.hint           = null;
  gs.turnStatus     = TURN_STATUS.CHOOSING;
  gs.timeLeft       = settings.drawTime;

  // Reset room players' guess flag
  await Room.updateOne({ code: roomCode }, { $set: { 'players.$[].hasGuessedThisTurn': false } });

  const drawerSocketId = gs.drawerOrder[gs.currentDrawerIndex];
  gs.currentDrawerSocketId = drawerSocketId;

  // Offer 3 word choices to drawer
  const words = pickWords(3, gs.customWords, gs.useCustomOnly);

  // Give drawer a time window to pick (use word-options event)
  io.to(drawerSocketId).emit(EVENTS.WORD_OPTIONS, { words });

  // Notify all about who's drawing
  io.to(roomCode).emit('drawer-selected', {
    drawerSocketId,
    round: gs.currentRound,
    totalRounds: gs.totalRounds,
  });

  // Auto-pick if drawer doesn't choose in 15s
  gs.choiceTimer = setTimeout(async () => {
    if (gs.turnStatus === TURN_STATUS.CHOOSING && activeGames.has(roomCode)) {
      const autoWord = words[Math.floor(Math.random() * words.length)];
      const drawerSocket = io.sockets.sockets.get(drawerSocketId);
      if (drawerSocket) {
        drawerSocket.emit(EVENTS.WORD_OPTIONS, { words: [autoWord], autoSelected: true });
      }
      gs.currentWord = autoWord;
      gs.hint        = buildHint(autoWord, 0);
      gs.turnStatus  = TURN_STATUS.DRAWING;
      gs.timeLeft    = settings.drawTime;
      gs.turnStartedAt = Date.now();

      io.to(roomCode).emit(EVENTS.TURN_STARTED, {
        drawerSocketId,
        hint: gs.hint,
        wordLength: autoWord.length,
        timeLeft: gs.timeLeft,
        round: gs.currentRound,
        totalRounds: gs.totalRounds,
      });

      startTurnTimer(io, activeGames, roomCode);
    }
  }, 15000);
}

function startTurnTimer(io, activeGames, roomCode) {
  const gs = activeGames.get(roomCode);
  if (!gs) return;

  clearInterval(gs.timer);
  clearInterval(gs.hintTimer);

  // Hint reveal intervals
  gs.hintTimer = setInterval(() => {
    const gs2 = activeGames.get(roomCode);
    if (!gs2 || gs2.turnStatus !== TURN_STATUS.DRAWING) return;
    const elapsed = gs2.drawTime - gs2.timeLeft;
    const revealCount = getHintRevealCount(gs2.currentWord, elapsed, gs2.drawTime);
    const newHint = buildHint(gs2.currentWord, revealCount);
    if (newHint !== gs2.hint) {
      gs2.hint = newHint;
      io.to(roomCode).emit(EVENTS.HINT_UPDATED, { hint: newHint });
    }
  }, 5000);

  gs.timer = setInterval(async () => {
    const gs2 = activeGames.get(roomCode);
    if (!gs2) { clearInterval(gs.timer); return; }

    gs2.timeLeft--;
    io.to(roomCode).emit(EVENTS.TIMER_TICK, { timeLeft: gs2.timeLeft });

    if (gs2.timeLeft <= 0) {
      clearInterval(gs2.timer);
      clearInterval(gs2.hintTimer);
      await endTurn(io, activeGames, roomCode);
    }
  }, 1000);
}

async function endTurn(io, activeGames, roomCode) {
  const gs = activeGames.get(roomCode);
  if (!gs || gs.turnStatus === TURN_STATUS.ENDED) return;
  gs.turnStatus = TURN_STATUS.ENDED;

  clearInterval(gs.timer);
  clearInterval(gs.hintTimer);
  clearTimeout(gs.choiceTimer);

  // Award drawer points
  const correctGuessCount = gs.guessedPlayers.size;
  const drawerSocket = io.sockets.sockets.get(gs.currentDrawerSocketId);
  if (correctGuessCount > 0) {
    gs.scores[gs.currentDrawerSocketId] = (gs.scores[gs.currentDrawerSocketId] || 0)
      + DRAWER_SCORE_PER_GUESSER * correctGuessCount;
  }

  // Persist scores to DB
  const room = await Room.findOne({ code: roomCode });
  if (room) {
    room.players.forEach(p => {
      if (gs.scores[p.socketId] !== undefined) p.score = gs.scores[p.socketId];
    });
    await room.save();
  }

  // Build ranked player list
  const players = room?.players.filter(p => p.isOnline).map(p => ({
    socketId: p.socketId,
    username: p.username,
    score: p.score,
  })) || [];

  io.to(roomCode).emit(EVENTS.TURN_ENDED, {
    word: gs.currentWord,
    scores: gs.scores,
    players: rankPlayers(players),
  });

  // Wait 4s then advance
  await sleep(4000);

  // Advance to next drawer / round
  gs.currentDrawerIndex++;

  const onlineRoom = await Room.findOne({ code: roomCode });
  const online = onlineRoom?.players.filter(p => p.isOnline) || [];

  if (gs.currentDrawerIndex >= gs.drawerOrder.length) {
    // All players drew this round
    gs.currentDrawerIndex = 0;
    gs.currentRound++;

    if (gs.currentRound > gs.totalRounds) {
      // Game over
      return endGame(io, activeGames, roomCode);
    }
  }

  // Filter out disconnected drawers
  gs.drawerOrder = gs.drawerOrder.filter(sid => online.some(p => p.socketId === sid));
  if (gs.drawerOrder.length === 0) return endGame(io, activeGames, roomCode);

  await startTurn(io, activeGames, roomCode, { drawTime: gs.drawTime, customWords: gs.customWords, useCustomOnly: gs.useCustomOnly });
}

async function endGame(io, activeGames, roomCode) {
  const gs = activeGames.get(roomCode);
  const room = await Room.findOne({ code: roomCode });

  const players = room?.players.filter(p => p.isOnline).map(p => ({
    socketId: p.socketId,
    username: p.username,
    score: p.score,
  })) || [];

  const rankings = rankPlayers(players);

  if (room) {
    room.status = 'finished';
    await room.save();
  }

  io.to(roomCode).emit(EVENTS.GAME_ENDED, { rankings });
  activeGames.delete(roomCode);
}

// Export endTurn for use in chatHandlers (early end when everyone guessed)
 export {endTurn};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
