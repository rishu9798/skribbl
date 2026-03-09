import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = (token, username) => {
    if (socketRef.current?.connected) return socketRef.current;

    const socket = io(SOCKET_URL, {
      auth: { token, username },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect',    () => { console.log('🔌 Socket connected'); setConnected(true); });
    socket.on('disconnect', () => { console.log('❌ Socket disconnected'); setConnected(false); });
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    socketRef.current = socket;
    return socket;
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => () => disconnect(), []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}
