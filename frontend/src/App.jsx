import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GameProvider }   from './context/GameContext';
import HomePage           from './pages/HomePage';
import LoginPage          from './pages/LoginPage';
import LobbyPage          from './pages/LobbyPage';
import GamePage           from './pages/GamePage';
import { useAuth }        from './hooks/useAuth';

// Protect game route — must have username
const RequireUser = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"        element={<HomePage />} />
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/lobby"   element={<RequireUser><LobbyPage /></RequireUser>} />
      <Route path="/game/:roomCode" element={<RequireUser><GamePage /></RequireUser>} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GameProvider>
            <AppRoutes />
          </GameProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
