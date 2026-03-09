
import express from 'express';

import { listRooms, createRoom, getRoom } from'../controllers/roomController.js';
import { optionalAuth } from '../middleware/auth.js';
const router = express.Router();
router.get('/',        optionalAuth, listRooms);
router.post('/',       optionalAuth, createRoom);
router.get('/:code',   optionalAuth, getRoom);

export default router;
