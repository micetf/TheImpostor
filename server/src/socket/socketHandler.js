// server/src/socket/socketHandler.js
import gameManager from "../game/GameManager.js";
import logger from "../utils/logger.js";

/**
 * Configure les gestionnaires d'événements Socket.IO
 * @param {Server} io - Instance Socket.IO
 */
export function setupSocketHandlers(io) {
    io.on("connection", (socket) => {
        logger.info(`Nouvelle connexion: ${socket.id}`);

        // Événement: Créer un salon
        socket.on("create-room", (callback) => {
            try {
                const roomId = gameManager.createRoom();
                logger.success(`Salon créé: ${roomId}`);

                if (callback) {
                    callback({ success: true, roomId });
                }
            } catch (error) {
                logger.error("Erreur création salon:", error);
                if (callback) {
                    callback({ success: false, error: error.message });
                }
            }
        });

        // Événement: Rejoindre un salon
        socket.on("join-room", ({ roomId, username }, callback) => {
            try {
                console.log(
                    `[Socket] ${username} tente de rejoindre ${roomId}`
                );

                const result = gameManager.joinRoom(
                    roomId,
                    socket.id,
                    username
                );

                if (result.success) {
                    // Rejoindre la room Socket.IO
                    socket.join(roomId);
                    socket.data.roomId = roomId;
                    socket.data.username = username;

                    console.log(
                        `[Socket] ${username} a rejoint la room Socket.IO ${roomId}`
                    );
                    console.log(
                        `[Socket] Sockets dans la room ${roomId}:`,
                        Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                    );

                    // Informer tous les joueurs du salon
                    const room = gameManager.getRoom(roomId);
                    console.log(
                        `[Socket] Émission room-updated vers ${roomId}`,
                        room.toJSON()
                    );
                    io.to(roomId).emit("room-updated", room.toJSON());

                    logger.success(`${username} a rejoint ${roomId}`);
                } else {
                    console.log(
                        `[Socket] Échec rejoindre pour ${username}: ${result.message}`
                    );
                }

                if (callback) {
                    callback(result);
                }
            } catch (error) {
                logger.error("Erreur rejoindre salon:", error);
                if (callback) {
                    callback({ success: false, message: error.message });
                }
            }
        });

        // Événement: Obtenir les infos d'un salon
        socket.on("get-room-info", (roomId, callback) => {
            try {
                const room = gameManager.getRoom(roomId);

                if (callback) {
                    if (room) {
                        callback({ success: true, room: room.toJSON() });
                    } else {
                        callback({
                            success: false,
                            message: "Salon non trouvé",
                        });
                    }
                }
            } catch (error) {
                logger.error("Erreur récupération info salon:", error);
                if (callback) {
                    callback({ success: false, error: error.message });
                }
            }
        });

        // Événement: Lister tous les salons (pour admin)
        socket.on("list-rooms", (callback) => {
            try {
                const rooms = gameManager.getAllRooms();

                if (callback) {
                    callback({ success: true, rooms });
                }
            } catch (error) {
                logger.error("Erreur liste salons:", error);
                if (callback) {
                    callback({ success: false, error: error.message });
                }
            }
        });

        // Événement: Déconnexion
        socket.on("disconnect", () => {
            const disconnectInfo = gameManager.handlePlayerDisconnect(
                socket.id
            );

            if (disconnectInfo) {
                const { roomId, username, roomEmpty } = disconnectInfo;
                logger.warn(`${username} déconnecté du salon ${roomId}`);

                if (!roomEmpty) {
                    // Informer les autres joueurs
                    const room = gameManager.getRoom(roomId);
                    if (room) {
                        io.to(roomId).emit("room-updated", room.toJSON());
                        io.to(roomId).emit("player-disconnected", { username });
                    }
                }
            }

            logger.info(`Déconnexion: ${socket.id}`);
        });
    });

    // Nettoyage périodique des joueurs déconnectés
    setInterval(() => {
        gameManager.cleanupDisconnectedPlayers();
    }, 30000); // Toutes les 30 secondes
}
