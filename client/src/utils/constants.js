// client/src/utils/constants.js

/**
 * Détecte l'URL du serveur en fonction de l'environnement
 * @returns {string} URL du serveur
 */
function getServerUrl() {
    // En production ou si VITE_SERVER_URL est défini
    if (import.meta.env.VITE_SERVER_URL) {
        return import.meta.env.VITE_SERVER_URL;
    }

    // En développement, utiliser localhost
    return "http://localhost:3001";
}

/**
 * Configuration de l'application
 */
export const CONFIG = {
    // URL du serveur Socket.IO (configurable via variable d'environnement)
    SERVER_URL: getServerUrl(),

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
        INITIATOR_NO_VOTE: -2,
    },
};

/**
 * Phases du jeu
 */
export const GAME_PHASES = {
    WAITING: "waiting",
    PLAYING: "playing",
    VOTING: "voting",
    PAUSED: "paused",
    ENDED: "ended",
};

/**
 * Événements Socket.IO
 */
export const SOCKET_EVENTS = {
    // Client → Serveur
    CREATE_ROOM: "create-room",
    JOIN_ROOM: "join-room",
    GET_ROOM_INFO: "get-room-info",
    LIST_ROOMS: "list-rooms",

    // Serveur → Client
    ROOM_UPDATED: "room-updated",
    PLAYER_DISCONNECTED: "player-disconnected",
};
