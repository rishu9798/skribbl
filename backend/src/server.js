import dotenv from 'dotenv'
dotenv.config();
import  express from 'express';
import http from 'http';
import  cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import connectDB  from './config/db.js';
import initSocket from './socket/index.js';
import authRoutes from './routes/auth.js';
import  roomRoutes from './routes/rooms.js';
import userRoutes  from './routes/users.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const httpServer = http.createServer(app);

// Connect Database 
connectDB();

// Middleware 
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// REST API Routes 
app.use('/api/auth',  authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Socket.IO 
initSocket(httpServer);

//  Error Handler
app.use(errorHandler);

// Start 
const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready`);
});
