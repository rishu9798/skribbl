import { createContext, useReducer, useCallback } from 'react';

export const GameContext = createContext(null);

const initialState = {
  // Room
  room:          null,        //  code, name, settings, players 
  players:       [],

  // Game flow
  gameStatus:    'waiting',   // waiting | choosing | drawing | ended
  currentRound:  1,
  totalRounds:   3,
  drawerSocketId: null,
  isMyTurn:      false,

  // Turn
  wordOptions:   [],          // only for drawer
  currentWord:   null,        // only for drawer
  hint:          '',          // e.g. "_ _ p _ _ e"
  timeLeft:      80,

  // Chat
  messages:      [],

  // End of turn / game
  turnResult:    null,        // { word, scores }
  gameResult:    null,        // { rankings }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, room: action.room, players: action.room.players };

    case 'ROOM_UPDATED':
      return { ...state, room: action.room, players: action.room.players };

    case 'PLAYER_JOINED':
      return { ...state, players: [...state.players.filter(p => p.socketId !== action.player.socketId), action.player] };

    case 'PLAYER_LEFT':
      return { ...state, players: state.players.filter(p => p.socketId !== action.socketId) };

    case 'GAME_STARTED':
      return { ...state, gameStatus: 'choosing', players: action.players, totalRounds: action.totalRounds, gameResult: null };

    case 'DRAWER_SELECTED':
      return { ...state, drawerSocketId: action.drawerSocketId, currentRound: action.round, gameStatus: 'choosing', wordOptions: [], currentWord: null };

    case 'WORD_OPTIONS':
      return { ...state, wordOptions: action.words };

    case 'WORD_CHOSEN':
      return { ...state, currentWord: action.word, wordOptions: [], gameStatus: 'drawing' };

    case 'TURN_STARTED':
      return { ...state, gameStatus: 'drawing', hint: action.hint, timeLeft: action.timeLeft, drawerSocketId: action.drawerSocketId, currentRound: action.round, totalRounds: action.totalRounds, turnResult: null };

    case 'HINT_UPDATED':
      return { ...state, hint: action.hint };

    case 'TIMER_TICK':
      return { ...state, timeLeft: action.timeLeft };

    case 'MESSAGE_RECEIVED':
      return { ...state, messages: [...state.messages.slice(-199), action.message] };

    case 'CORRECT_GUESS':
      return {
        ...state,
        players: state.players.map(p =>
          p.socketId === action.socketId ? { ...p, hasGuessedThisTurn: true } : p
        ),
      };

    case 'UPDATE_SCORES':
      return {
        ...state,
        players: state.players.map(p =>
          action.scores[p.socketId] !== undefined
            ? { ...p, score: action.scores[p.socketId] }
            : p
        ),
      };

    case 'TURN_ENDED':
      return { ...state, gameStatus: 'summary', turnResult: { word: action.word, scores: action.scores, players: action.players }, currentWord: null };

    case 'GAME_ENDED':
      return { ...state, gameStatus: 'ended', gameResult: action.rankings };

    case 'RESET_GAME':
      return { ...initialState, room: state.room, players: state.players };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setRoom        = useCallback((room)    => dispatch({ type: 'SET_ROOM', room }), []);
  const addMessage     = useCallback((message) => dispatch({ type: 'MESSAGE_RECEIVED', message }), []);
  const resetGame      = useCallback(()         => dispatch({ type: 'RESET_GAME' }), []);

  return (
    <GameContext.Provider value={{ state, dispatch, setRoom, addMessage, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}
