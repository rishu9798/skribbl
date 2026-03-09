export default  {
  // Game settings
  DEFAULT_ROUNDS: 3,
  DEFAULT_DRAW_TIME: 80,       
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 12,
  WORD_CHOICES: 3,             // words offered to drawer

  
  MAX_SCORE_GUESSER: 300,      // points for instant guess
  MIN_SCORE_GUESSER: 50,       // points for last-second guess
  DRAWER_SCORE_PER_GUESSER: 25, // drawer earns per correct guesser

  
  HINT_REVEAL_INTERVALS: [0.4, 0.7], 

  // Socket events
  EVENTS: {
    // Client → Server
    JOIN_ROOM:     'join-room',
    LEAVE_ROOM:    'leave-room',
    START_GAME:    'start-game',
    WORD_CHOSEN:   'word-chosen',
    DRAW_STROKE:   'draw-stroke',
    CLEAR_CANVAS:  'clear-canvas',
    FILL_CANVAS:   'fill-canvas',
    SEND_MESSAGE:  'send-message',
    KICK_PLAYER:   'kick-player',

    // Server → Client
    ROOM_UPDATED:     'room-updated',
    GAME_STARTED:     'game-started',
    TURN_STARTED:     'turn-started',
    WORD_OPTIONS:     'word-options',
    HINT_UPDATED:     'hint-updated',
    TIMER_TICK:       'timer-tick',
    MESSAGE_RECEIVED: 'message-received',
    CORRECT_GUESS:    'correct-guess',
    TURN_ENDED:       'turn-ended',
    GAME_ENDED:       'game-ended',
    PLAYER_JOINED:    'player-joined',
    PLAYER_LEFT:      'player-left',
    ERROR:            'game-error',
  },

  // Room statuses
  ROOM_STATUS: {
    WAITING:  'waiting',
    PLAYING:  'playing',
    FINISHED: 'finished',
  },

  // Turn statuseses
  TURN_STATUS: {
    CHOOSING: 'choosing',   
    DRAWING:  'drawing',    
    ENDED:    'ended',
  },
};
