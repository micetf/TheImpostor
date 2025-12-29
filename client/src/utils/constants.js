// client/src/utils/constants.js

/**
 * Configuration de l'application
 */
export const CONFIG = {
  // URL du serveur Socket.IO
  SERVER_URL: 'http://localhost:3001',
  
  // Limites
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 10,
  WINNING_SCORE: 10,
  
  // Durées (en secondes)
  VOTE_DURATION: 30,
  RECONNECT_WINDOW: 120,
  
  // Règles de scoring
  POINTS: {
    CORRECT_VOTE: 1,
    WRONG_VOTE: -1,
    INITIATOR_CORRECT: 2,
    INITIATOR_WRONG: -2,
    NO_VOTE: -1,
    INITIATOR_NO_VOTE: -2
  }
};

/**
 * Phases du jeu
 */
export const GAME_PHASES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  VOTING: 'voting',
  PAUSED: 'paused',
  ENDED: 'ended'
};

/**
 * Événements Socket.IO
 */
export const SOCKET_EVENTS = {
  // Client → Serveur
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  GET_ROOM_INFO: 'get-room-info',
  LIST_ROOMS: 'list-rooms',
  
  // Serveur → Client
  ROOM_UPDATED: 'room-updated',
  PLAYER_DISCONNECTED: 'player-disconnected'
};
