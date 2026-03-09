# 🎨 Skribbl Clone — Full-Stack Drawing & Guessing Game

A real-time multiplayer drawing and guessing game built with **React + Vite** (frontend) and **Node.js + Express + Socket.IO + MongoDB** (backend).

##  Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or pnpm

### 1. Clone & Install


git clone <repo-url>
cd skribbl-clone

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install

### 2. Run Locally (two terminals)

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # nodemon src/server.js

# Terminal 2 — Frontend
cd frontend
npm run dev        # vite dev server on :5173
```

### 4. Build for Production

```bash
cd frontend && npm run build    # outputs to frontend/dist/
cd backend && npm start         # NODE_ENV=production
```

