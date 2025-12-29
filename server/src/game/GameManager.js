// server/src/game/GameManager.js
import { nanoid } from "nanoid";
import Room from "./Room.js";

/**
 * Gestionnaire central du jeu
 * Singleton qui gère tous les salons
 */
class GameManager {
    constructor() {
        this.rooms = new Map();
        this.disconnectedPlayers = new Map();

        // Constantes de jeu
        this.VOTE_DURATION = 30; // secondes
        this.WINNING_SCORE = 10;
        this.RECONNECT_WINDOW = 120000; // 2 minutes en ms
    }

    /**
     * Crée un nouveau salon
     * @param {number} maxPlayers - Nombre maximum de joueurs (par défaut 10)
     * @returns {string} - ID du salon créé
     */
    createRoom(maxPlayers = 10) {
        const roomId = nanoid(8).toUpperCase();
        const room = new Room(roomId, maxPlayers);
        this.rooms.set(roomId, room);

        console.log(`[GameManager] Salon créé: ${roomId}`);
        return roomId;
    }

    /**
     * Récupère les informations d'un salon
     * @param {string} roomId - ID du salon
     * @returns {Room|null}
     */
    getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }

    /**
     * Récupère tous les salons actifs
     * @returns {Array} - Liste des salons
     */
    getAllRooms() {
        return Array.from(this.rooms.values()).map((room) => room.toJSON());
    }

    /**
     * Fait rejoindre un joueur à un salon
     * @param {string} roomId - ID du salon
     * @param {string} socketId - ID du socket du joueur
     * @param {string} username - Nom d'utilisateur
     * @returns {object} - {success: boolean, message: string, player: Player|null}
     */
    joinRoom(roomId, socketId, username) {
        const room = this.getRoom(roomId);

        if (!room) {
            return {
                success: false,
                message: "Salon non trouvé",
                player: null,
            };
        }

        // Vérifier si le joueur existe déjà (re-join)
        const existingPlayer = room.players.find(
            (p) => p.username === username
        );

        if (existingPlayer) {
            // Re-join : mettre à jour le socket ID
            console.log(
                `[GameManager] ${username} re-join avec nouveau socket ${socketId}`
            );
            existingPlayer.id = socketId;
            return {
                success: true,
                message: "Re-connecté avec succès",
                player: existingPlayer,
                room: room.toJSON(),
            };
        }

        if (room.started) {
            return {
                success: false,
                message: "La partie a déjà commencé",
                player: null,
            };
        }

        const player = room.addPlayer(socketId, username);

        if (!player) {
            return {
                success: false,
                message:
                    "Impossible de rejoindre (salon plein ou nom déjà pris)",
                player: null,
            };
        }

        console.log(`[GameManager] ${username} a rejoint le salon ${roomId}`);
        return {
            success: true,
            message: "Rejoint avec succès",
            player,
            room: room.toJSON(),
        };
    }

    /**
     * Gère la déconnexion d'un joueur
     * @param {string} socketId - ID du socket déconnecté
     * @returns {object} - Informations sur la déconnexion
     */
    handlePlayerDisconnect(socketId) {
        // Trouver le salon du joueur
        for (const [roomId, room] of this.rooms.entries()) {
            const player = room.findPlayer(socketId);

            if (player) {
                console.log(
                    `[GameManager] Déconnexion de ${player.username} du salon ${roomId}`
                );

                // Sauvegarder pour reconnexion possible
                this.disconnectedPlayers.set(player.username, {
                    roomId,
                    player,
                    disconnectTime: Date.now(),
                });

                // Retirer du salon
                room.removePlayer(socketId);

                // Si le salon est vide, le supprimer
                if (room.isEmpty()) {
                    this.rooms.delete(roomId);
                    console.log(
                        `[GameManager] Salon ${roomId} supprimé (vide)`
                    );
                }

                return {
                    roomId,
                    username: player.username,
                    wasHost: player.isHost,
                    roomEmpty: room.isEmpty(),
                };
            }
        }

        return null;
    }

    /**
     * Nettoie les joueurs déconnectés expirés
     */
    cleanupDisconnectedPlayers() {
        const now = Date.now();

        for (const [username, data] of this.disconnectedPlayers.entries()) {
            if (now - data.disconnectTime > this.RECONNECT_WINDOW) {
                this.disconnectedPlayers.delete(username);
                console.log(
                    `[GameManager] Timeout de reconnexion pour ${username}`
                );
            }
        }
    }
}

// Export du singleton
export default new GameManager();
