
import express from 'express';

import  { signup, login, logout, me, guest } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/login',  login);
router.post('/logout', logout);
router.post('/guest',  guest);
router.get('/me', requireAuth, me);

 export default router;
