// server/src/game/Room.js
import Player from './Player.js';

/**
 * Représente un salon de jeu
 */
class Room {
  constructor(roomId, maxPlayers = 10) {
    this.id = roomId;
    this.players = [];
    this.maxPlayers = maxPlayers;
    this.started = false;
    this.currentPair = null;
    this.gameState = {
      phase: 'waiting', // waiting, playing, voting, paused, ended
      currentRound: 0,
      votes: new Map(),
      votedPlayers: new Set(),
      voteInitiator: null,
      firstSpeaker: null,
      roundTimer: null,
      winner: null
    };
    this.history = [];
  }

  /**
   * Ajoute un joueur au salon
   * @param {string} socketId - ID du socket du joueur
   * @param {string} username - Nom d'utilisateur
   * @returns {Player|null} - Le joueur ajouté ou null si échec
   */
  addPlayer(socketId, username) {
    // Vérifier la capacité
    if (this.players.length >= this.maxPlayers) {
      return null;
    }

    // Vérifier si le nom est déjà pris
    if (this.players.some(p => p.username === username)) {
      return null;
    }

    const player = new Player(socketId, username);
    
    // Le premier joueur devient l'hôte
    if (this.players.length === 0) {
      player.isHost = true;
    }

    this.players.push(player);
    return player;
  }

  /**
   * Retire un joueur du salon
   * @param {string} socketId - ID du socket du joueur
   * @returns {Player|null} - Le joueur retiré ou null si non trouvé
   */
  removePlayer(socketId) {
    const index = this.players.findIndex(p => p.id === socketId);
    if (index === -1) return null;

    const [removedPlayer] = this.players.splice(index, 1);
    
    // Si c'était l'hôte, désigner un nouvel hôte
    if (removedPlayer.isHost && this.players.length > 0) {
      this.players[0].isHost = true;
    }

    return removedPlayer;
  }

  /**
   * Trouve un joueur par son ID de socket
   * @param {string} socketId - ID du socket
   * @returns {Player|null}
   */
  findPlayer(socketId) {
    return this.players.find(p => p.id === socketId) || null;
  }

  /**
   * Vérifie si le salon peut démarrer une partie
   * @returns {boolean}
   */
  canStart() {
    return this.players.length >= 3 && !this.started;
  }

  /**
   * Vérifie si le salon est vide
   * @returns {boolean}
   */
  isEmpty() {
    return this.players.length === 0;
  }

  /**
   * Retourne une représentation sérialisable du salon
   * @returns {object}
   */
  toJSON() {
    return {
      id: this.id,
      playerCount: this.players.length,
      maxPlayers: this.maxPlayers,
      started: this.started,
      phase: this.gameState.phase,
      players: this.players.map(p => p.toJSON(true)), // On cache les mots
      canStart: this.canStart()
    };
  }
}

export default Room;
