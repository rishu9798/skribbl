import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { GameContext }   from '../context/GameContext';

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};


 // Register game-related socket event listeners and wire them to dispatch.
 //Call this once inside GamePage.
 
export const useGameSocketEvents = (socket) => {
  const { dispatch, addMessage } = useContext(GameContext);

  useEffect(() => {
    if (!socket) return;

    const handlers = {
      'room-updated':      (room)    => dispatch({ type: 'ROOM_UPDATED', room }),
      'player-joined':     ({ player }) => dispatch({ type: 'PLAYER_JOINED', player }),
      'player-left':       ({ socketId }) => dispatch({ type: 'PLAYER_LEFT', socketId }),
      'game-started':      (data)    => dispatch({ type: 'GAME_STARTED', ...data }),
      'drawer-selected':   (data)    => dispatch({ type: 'DRAWER_SELECTED', ...data }),
      'word-options':      ({ words }) => dispatch({ type: 'WORD_OPTIONS', words }),
      'turn-started':      (data)    => dispatch({ type: 'TURN_STARTED', ...data }),
      'hint-updated':      ({ hint }) => dispatch({ type: 'HINT_UPDATED', hint }),
      'timer-tick':        ({ timeLeft }) => dispatch({ type: 'TIMER_TICK', timeLeft }),
      'message-received':  (msg)     => addMessage(msg),
      'correct-guess':     (data)    => dispatch({ type: 'CORRECT_GUESS', ...data }),
      'turn-ended':        (data)    => dispatch({ type: 'TURN_ENDED', ...data }),
      'game-ended':        ({ rankings }) => dispatch({ type: 'GAME_ENDED', rankings }),
      'game-error':        ({ message }) => console.error('Game error:', message),
    };

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
    return () => Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));
  }, [socket]);
};
