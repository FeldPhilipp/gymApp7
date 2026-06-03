import { io } from 'socket.io-client';
import { isNativeApp } from '../utils/platform';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: !isNativeApp(),
      transports: ['websocket', 'polling'], // Fallback
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('[Socket.io] ✅ Verbunden mit Server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] ❌ Verbindung getrennt:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.io] ⚠️ Verbindungsfehler:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.io] Socket getrennt');
  }
};