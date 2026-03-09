
import mongoose from 'mongoose';
import constants from '../config/constants.js';

const { ROOM_STATUS, DEFAULT_ROUNDS, DEFAULT_DRAW_TIME, MAX_PLAYERS } = constants;
const playerSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = guest
  socketId: { type: String, required: true },
  username: { type: String, required: true },
  avatar:   { color: String, emoji: String },
  score:    { type: Number, default: 0 },
  isHost:   { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
  hasGuessedThisTurn: { type: Boolean, default: false },
}, { _id: true });

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6,
  },
  name: {
    type: String,
    default: function () { return `Room ${this.code}`; },
    maxlength: 40,
  },
  status: {
    type: String,
    enum: Object.values(ROOM_STATUS),
    default: ROOM_STATUS.WAITING,
  },
  settings: {
    maxPlayers:   { type: Number, default: MAX_PLAYERS, min: 2, max: 12 },
    rounds:       { type: Number, default: DEFAULT_ROUNDS, min: 1, max: 10 },
    drawTime:     { type: Number, default: DEFAULT_DRAW_TIME, min: 15, max: 180 },
    language:     { type: String, default: 'en' },
    customWords:  [String],
    useCustomOnly:{ type: Boolean, default: false },
    isPrivate:    { type: Boolean, default: false },
    password:     { type: String, default: '' },
  },
  players: [playerSchema],
  currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
  hostSocketId: { type: String },
}, { timestamps: true });

// Generate unique 6-char room code
roomSchema.statics.generateCode = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Get public player list (no sensitive data)
roomSchema.virtual('publicPlayers').get(function () {
  return this.players.filter(p => p.isOnline).map(p => ({
    id: p._id,
    username: p.username,
    avatar: p.avatar,
    score: p.score,
    isHost: p.isHost,
    hasGuessedThisTurn: p.hasGuessedThisTurn,
  }));
});


export default mongoose.model('Room',roomSchema)
