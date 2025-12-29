// server/src/game/Room.js
import Player from "./Player.js";

/**
 * Représente un salon de jeu
 *
 * ⚠️ RÈGLE DE CONFIDENTIALITÉ :
 * L'information isImpostor des joueurs ne doit JAMAIS être transmise au client.
 * - Utiliser toGameJSON() pour les données client-safe (sans isImpostor)
 * - Utiliser toServerJSON() uniquement pour les traitements serveur
 */
class Room {
    constructor(roomId, maxPlayers = 10) {
        this.id = roomId;
        this.players = [];
        this.maxPlayers = maxPlayers;
        this.started = false;
        this.currentPair = null;
        this.gameState = {
            phase: "waiting", // waiting, playing, voting, paused, ended
            currentRound: 0,
            votes: new Map(),
            votedPlayers: new Set(),
            voteInitiator: null,
            firstSpeaker: null,
            roundTimer: null,
            winner: null,
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
        if (this.players.some((p) => p.username === username)) {
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
        const index = this.players.findIndex((p) => p.id === socketId);
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
        return this.players.find((p) => p.id === socketId) || null;
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
     * Démarre la partie en distribuant les mots et désignant les rôles
     * @param {Array} wordPairs - Tableau des paires de mots disponibles
     * @returns {object} - État de la partie après démarrage
     */
    startGame(wordPairs) {
        // Vérifications préliminaires
        if (this.started) {
            return { success: false, message: "La partie a déjà commencé" };
        }

        if (!this.canStart()) {
            return {
                success: false,
                message: "Pas assez de joueurs pour démarrer",
            };
        }

        // 1. Sélectionner une paire de mots aléatoire
        const randomIndex = Math.floor(Math.random() * wordPairs.length);
        this.currentPair = {
            team: wordPairs[randomIndex][0],
            intruder: wordPairs[randomIndex][1],
        };

        // 2. Désigner un intrus aléatoire
        const randomIntruderIndex = Math.floor(
            Math.random() * this.players.length
        );

        // 3. Distribuer les mots
        this.players.forEach((player, index) => {
            if (index === randomIntruderIndex) {
                player.currentWord = this.currentPair.intruder;
                player.isImpostor = true;
            } else {
                player.currentWord = this.currentPair.team;
                player.isImpostor = false;
            }
        });

        // 4. Désigner le premier orateur aléatoirement
        const randomSpeakerIndex = Math.floor(
            Math.random() * this.players.length
        );
        this.gameState.firstSpeaker = this.players[randomSpeakerIndex].id;

        // 5. Mettre à jour l'état du jeu
        this.started = true;
        this.gameState.phase = "playing";
        this.gameState.currentRound += 1;

        console.log(
            `[Room ${this.id}] Partie démarrée - Tour ${this.gameState.currentRound}`
        );
        console.log(
            `[Room ${this.id}] Paire: ${this.currentPair.team} / ${this.currentPair.intruder}`
        );
        console.log(
            `[Room ${this.id}] Premier orateur: ${this.gameState.firstSpeaker}`
        );

        return {
            success: true,
            message: "Partie démarrée avec succès",
            gameState: this.toGameJSON(),
        };
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
            players: this.players.map((p) => p.toJSON(true)), // On cache les mots
            canStart: this.canStart(),
        };
    }

    /**
     * Retourne l'état du jeu pour les joueurs (SANS révéler qui est l'intrus)
     * @param {string} playerId - ID du joueur qui demande l'état (optionnel)
     * @returns {object}
     */
    toGameJSON(playerId = null) {
        return {
            id: this.id,
            started: this.started,
            phase: this.gameState.phase,
            currentRound: this.gameState.currentRound,
            firstSpeaker: this.gameState.firstSpeaker,
            players: this.players.map((p) => ({
                id: p.id,
                username: p.username,
                isHost: p.isHost,
                score: p.score,
                currentWord: p.id === playerId ? p.currentWord : null,
            })),
        };
    }

    /**
     * Retourne l'état complet du jeu (pour le serveur uniquement)
     * Utilisé pour les calculs de scoring et la validation des votes
     * ⚠️ NE JAMAIS envoyer cette donnée au client via Socket.IO
     * @returns {object}
     */
    toServerJSON() {
        return {
            id: this.id,
            started: this.started,
            phase: this.gameState.phase,
            currentRound: this.gameState.currentRound,
            firstSpeaker: this.gameState.firstSpeaker,
            currentPair: this.currentPair,
            players: this.players.map((p) => ({
                id: p.id,
                username: p.username,
                isHost: p.isHost,
                score: p.score,
                currentWord: p.currentWord,
                isImpostor: p.isImpostor,
            })),
        };
    }
}

export default Room;
