import Room from "../models/Room.js";

// GET /api/rooms — list public waiting rooms

export const listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      'settings.isPrivate': false,
      status: 'waiting',
    })
      .select('code name settings.maxPlayers players status createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    const list = rooms.map(r => ({
      code: r.code,
      name: r.name,
      playerCount: r.players.filter(p => p.isOnline).length,
      maxPlayers: r.settings.maxPlayers,
      status: r.status,
    }));

    res.json({ rooms: list });
  } catch (err) {
    next(err);
  }
};


//  POST /api/rooms — create a new room
 
export const createRoom = async (req, res, next) => {
  try {
    let code;
    let attempts = 0;
    do {
      code = Room.generateCode();
      attempts++;
    } while (await Room.exists({ code }) && attempts < 10);

    const { name, maxPlayers, rounds, drawTime, isPrivate, customWords, useCustomOnly } = req.body;

    const room = await Room.create({
      code,
      name: name || `Room ${code}`,
      settings: {
        maxPlayers:    maxPlayers    ?? 12,
        rounds:        rounds        ?? 3,
        drawTime:      drawTime      ?? 80,
        isPrivate:     isPrivate     ?? false,
        customWords:   customWords   ?? [],
        useCustomOnly: useCustomOnly ?? false,
      },
      players: [],
    });

    res.status(201).json({ room: { code: room.code, name: room.name, settings: room.settings } });
  } catch (err) {
    next(err);
  }
};

// GET /api/rooms/:code — get room information
export const  getRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    res.json({
      code: room.code,
      name: room.name,
      status: room.status,
      settings: room.settings,
      playerCount: room.players.filter(p => p.isOnline).length,
    });
  } catch (err) {
    next(err);
  }
};
