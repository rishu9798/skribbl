
import mongoose from "mongoose";

// Stores compressed stroke data for drawing replays
const strokeSchema = new mongoose.Schema({
  tool:      { type: String, enum: ['pen', 'eraser', 'fill'], default: 'pen' },
  color:     { type: String, default: '#000000' },
  size:      { type: Number, default: 4 },
  points:    [[Number]],   
  timestamp: { type: Number },   
}, { _id: false });

const drawingSchema = new mongoose.Schema({
  game:   { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  round:  { type: Number, required: true },
  drawer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  word:   { type: String, required: true },
  strokes: [strokeSchema],
  thumbnail: { type: String },   
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient game/round lookups
drawingSchema.index({ game: 1, round: 1 });


export default mongoose.model('Drawing',drawingSchema);
