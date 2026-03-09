
import express from 'express';
import  User from '../models/User.js';
import  { requireAuth } from  '../middleware/auth.js';


const router = express.Router();
// GET /api/users/:id — public profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('username avatar stats createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
});

// PATCH /api/users/me — update own profile
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['avatar'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) { next(err); }
});

export default router;