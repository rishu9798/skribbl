import User from '../models/User.js';
import { signToken } from '../utils/tokenUtils.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};


export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const user = await User.create({ username, email, password });
    const token = signToken({ id: user._id, username: user.username });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};


 // POST /api/auth/login
 
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user._id, username: user.username });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

//POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};


// GET /api/auth/me
 
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/guest — create a temporary guest session
 
export const guest = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const token = signToken({ id: null, username, isGuest: true });

  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ user: { username, isGuest: true }, token });
};