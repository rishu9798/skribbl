import constants from '../config/constants.js';

const { EVENTS, TURN_STATUS } = constants;
export default({ io, socket, activeGames }) => {

  // draw-stroke 
  // Relay drawing strokes to all room members except sender
  socket.on(EVENTS.DRAW_STROKE, (data) => {
    const { roomCode, points, color, size, tool } = data;
    if (!roomCode) return;

    const gs = activeGames.get(roomCode);
    if (!gs || gs.currentDrawerSocketId !== socket.id) return;
    if (gs.turnStatus !== TURN_STATUS.DRAWING) return;

    // Broadcast to everyone else in the room
    socket.to(roomCode).emit(EVENTS.DRAW_STROKE, { points, color, size, tool });
  });

  //clear-canvas 
  socket.on(EVENTS.CLEAR_CANVAS, ({ roomCode }) => {
    const gs = activeGames.get(roomCode);
    if (!gs || gs.currentDrawerSocketId !== socket.id) return;

    socket.to(roomCode).emit(EVENTS.CLEAR_CANVAS);
  });

  //fill-canvas
  // Broadcast fill event — flood fill is computed client-side, we just relay coords
  socket.on(EVENTS.FILL_CANVAS, ({ roomCode, x, y, color }) => {
    const gs = activeGames.get(roomCode);
    if (!gs || gs.currentDrawerSocketId !== socket.id) return;

    socket.to(roomCode).emit(EVENTS.FILL_CANVAS, { x, y, color });
  });
};
