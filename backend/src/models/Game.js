
import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  drawer: {
    playerId: mongoose.Schema.Types.ObjectId,
    username: String,
    socketId: String,
  },
  word: { type: String, required: true },
  hint: { type: String },          
  startedAt: { type: Date },
  endedAt:   { type: Date },
  guesses: [{
    playerId: mongoose.Schema.Types.ObjectId,
    username: String,
    guessedAt: Date,
    timeTaken: Number,             // seconds from turn start
    points:    Number,
    isCorrect: Boolean,
  }],
  drawingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drawing' },
});

const gameSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  status: {
    type: String,
    enum: ['active', 'finished'],
    default: 'active',
  },
  totalRounds: { type: Number, required: true },
  currentRound: { type: Number, default: 1 },
  drawerOrder: [String],           // ordered list of socket IDs for turn rotation
  currentDrawerIndex: { type: Number, default: 0 },
  rounds: [roundSchema],
  finalScores: [{
    playerId: mongoose.Schema.Types.ObjectId,
    username: String,
    totalScore: Number,
    rank: Number,
  }],
  startedAt:  { type: Date, default: Date.now },
  finishedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);