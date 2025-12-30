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

        // ============================================
        // ÉVÉNEMENT: Créer un salon
        // ============================================
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

        // ============================================
        // ÉVÉNEMENT: Rejoindre un salon
        // ============================================
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

        // ============================================
        // ÉVÉNEMENT: Démarrer la partie (réservé à l'hôte)
        // ============================================
        socket.on("start-game", (roomId, callback) => {
            try {
                const room = gameManager.getRoom(roomId);

                if (!room) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Salon non trouvé",
                        });
                    }
                    return;
                }

                // Vérifier que l'émetteur est bien l'hôte
                const player = room.findPlayer(socket.id);
                if (!player || !player.isHost) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Seul l'hôte peut démarrer la partie",
                        });
                    }
                    return;
                }

                // Importer les paires de mots
                import("../data/wordPairs.js").then((module) => {
                    const wordPairs = module.default;

                    // Démarrer la partie
                    const result = room.startGame(wordPairs);

                    if (result.success) {
                        // Informer TOUS les joueurs que la partie démarre
                        io.to(roomId).emit("game-started", {
                            phase: "playing",
                            currentRound: room.gameState.currentRound,
                            firstSpeaker: room.gameState.firstSpeaker,
                        });

                        // ✅ CRITIQUE : Envoyer à CHAQUE joueur UNIQUEMENT son mot
                        room.players.forEach((player) => {
                            console.log(
                                `📤 Envoi du mot à ${player.username} (${player.id}): "${player.currentWord}"`
                            );
                            io.to(player.id).emit("word-assigned", {
                                word: player.currentWord,
                            });
                        });

                        logger.success(
                            `Partie démarrée dans ${roomId} - Tour ${room.gameState.currentRound}`
                        );
                        logger.info(
                            `Intrus: ${
                                room.players.find((p) => p.isImpostor)
                                    ?.username || "N/A"
                            }`
                        );
                    }

                    if (callback) {
                        callback(result);
                    }
                });
            } catch (error) {
                logger.error("Erreur démarrage partie:", error);
                if (callback) {
                    callback({ success: false, message: error.message });
                }
            }
        });

        // ============================================
        // ÉVÉNEMENT: Initier le vote (Sprint 2)
        // ============================================
        socket.on("initiate-vote", (roomId, callback) => {
            try {
                const room = gameManager.getRoom(roomId);

                if (!room) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Salon non trouvé",
                        });
                    }
                    return;
                }

                // Vérifier que la partie est en phase "playing"
                if (room.gameState.phase !== "playing") {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Impossible de voter maintenant",
                        });
                    }
                    return;
                }

                // Lancer le vote
                const result = room.initiateVote(socket.id);

                if (result.success) {
                    // Informer tous les joueurs du début du vote
                    io.to(roomId).emit("vote-started", {
                        initiator: result.initiator,
                        duration: 30,
                        voteEndTime: result.voteEndTime,
                    });

                    logger.info(
                        `Vote initié dans ${roomId} par ${result.initiator}`
                    );

                    // Timer serveur pour fin automatique du vote
                    setTimeout(() => {
                        const room = gameManager.getRoom(roomId);
                        if (
                            room &&
                            room.gameState.phase === "voting" &&
                            !room.gameState.voteEnded
                        ) {
                            logger.info(
                                `⏰ Timer expiré - Fin automatique du vote dans ${roomId}`
                            );
                            endVoteAndSendResults(io, roomId);
                        }
                    }, result.duration * 1000); // ⬅️ MODIFIÉ : utiliser result.duration
                }

                if (callback) {
                    callback(result);
                }
            } catch (error) {
                logger.error("Erreur initiation vote:", error);
                if (callback) {
                    callback({ success: false, message: error.message });
                }
            }
        });

        // ============================================
        // ÉVÉNEMENT: Voter pour un joueur (Sprint 2)
        // ============================================
        socket.on("cast-vote", ({ roomId, targetId }, callback) => {
            try {
                const room = gameManager.getRoom(roomId);

                if (!room) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Salon non trouvé",
                        });
                    }
                    return;
                }

                // Vérifier que le vote est en cours
                if (room.gameState.phase !== "voting") {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Aucun vote en cours",
                        });
                    }
                    return;
                }

                // Enregistrer le vote
                const result = room.castVote(socket.id, targetId);

                if (result.success) {
                    // Informer tous les joueurs du nombre de votes
                    io.to(roomId).emit("vote-registered", {
                        votesCount: result.votesCount,
                        totalPlayers: result.totalPlayers,
                    });

                    const voter = room.findPlayer(socket.id);
                    const target = room.findPlayer(targetId);
                    logger.info(
                        `Vote dans ${roomId}: ${voter?.username} → ${target?.username} (${result.votesCount}/${result.totalPlayers})`
                    );

                    // Si tous les joueurs ont voté, terminer immédiatement
                    if (result.allVoted) {
                        logger.info(
                            `✅ Tous les joueurs ont voté dans ${roomId} - Fin anticipée`
                        );
                        endVoteAndSendResults(io, roomId);
                    }
                }

                if (callback) {
                    callback(result);
                }
            } catch (error) {
                logger.error("Erreur enregistrement vote:", error);
                if (callback) {
                    callback({ success: false, message: error.message });
                }
            }
        });

        // ============================================
        // ÉVÉNEMENT: Démarrer le tour suivant (Sprint 2)
        // ============================================
        socket.on("start-next-round", (roomId, callback) => {
            try {
                const room = gameManager.getRoom(roomId);

                if (!room) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Salon non trouvé",
                        });
                    }
                    return;
                }

                // Vérifier que l'émetteur est l'hôte
                const player = room.findPlayer(socket.id);
                if (!player || !player.isHost) {
                    if (callback) {
                        callback({
                            success: false,
                            message:
                                "Seul l'hôte peut démarrer le tour suivant",
                        });
                    }
                    return;
                }

                // Importer les paires de mots
                import("../data/wordPairs.js").then((module) => {
                    const wordPairs = module.default;

                    // Démarrer le nouveau tour
                    const result = room.startNextRound(wordPairs);

                    if (result.success) {
                        // Informer tous les joueurs
                        io.to(roomId).emit("new-round-started", {
                            phase: "playing",
                            currentRound: room.gameState.currentRound,
                            firstSpeaker: room.gameState.firstSpeaker,
                        });

                        // Envoyer les nouveaux mots
                        room.players.forEach((player) => {
                            console.log(
                                `📤 Nouveau mot pour ${player.username}: "${player.currentWord}"`
                            );
                            io.to(player.id).emit("word-assigned", {
                                word: player.currentWord,
                            });
                        });

                        logger.success(
                            `Nouveau tour démarré dans ${roomId} - Tour ${room.gameState.currentRound}`
                        );
                    }

                    if (callback) {
                        callback(result);
                    }
                });
            } catch (error) {
                logger.error("Erreur démarrage nouveau tour:", error);
                if (callback) {
                    callback({ success: false, message: error.message });
                }
            }
        });

        // ============================================
        // ÉVÉNEMENT: Obtenir les infos d'un salon
        // ============================================
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

        // ============================================
        // ÉVÉNEMENT: Obtenir l'état du jeu
        // ============================================
        socket.on("get-game-state", (roomId, callback) => {
            try {
                const room = gameManager.getRoom(roomId);

                if (!room) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Salon non trouvé",
                        });
                    }
                    return;
                }

                // ⬅️ TROUVER LE JOUEUR QUI DEMANDE L'ÉTAT
                const player = room.findPlayer(socket.id);

                if (!player) {
                    if (callback) {
                        callback({
                            success: false,
                            message: "Joueur non trouvé dans ce salon",
                        });
                    }
                    return;
                }

                // Envoyer l'état complet du jeu pour ce joueur
                const gameState = {
                    success: true,
                    phase: room.gameState.phase,
                    currentRound: room.gameState.currentRound,
                    firstSpeaker: room.gameState.firstSpeaker,
                    voteEndTime: room.gameState.voteEndTime,
                    word: player.currentWord, // ⬅️ AJOUTER LE MOT DU JOUEUR
                    players: room.players.map((p) => ({
                        id: p.id,
                        username: p.username,
                        isHost: p.isHost,
                        score: p.score,
                    })),
                };

                console.log(
                    `[Socket] ${socket.id} (${player.username}) demande l'état du jeu ${roomId}`
                );
                console.log(`   - Mot attribué: "${player.currentWord}"`);

                if (callback) {
                    callback(gameState);
                }
            } catch (error) {
                logger.error("Erreur récupération état du jeu:", error);
                if (callback) {
                    callback({ success: false, message: error.message });
                }
            }
        });

        // ============================================
        // ÉVÉNEMENT: Lister tous les salons (pour admin)
        // ============================================
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

        // ============================================
        // ÉVÉNEMENT: Déconnexion
        // ============================================
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

    // ============================================
    // Nettoyage périodique des joueurs déconnectés
    // ============================================
    setInterval(() => {
        gameManager.cleanupDisconnectedPlayers();
    }, 30000); // Toutes les 30 secondes
}

/**
 * Fonction helper pour terminer le vote et envoyer les résultats
 * @param {Server} io - Instance Socket.IO
 * @param {string} roomId - ID du salon
 */
function endVoteAndSendResults(io, roomId) {
    const room = gameManager.getRoom(roomId);
    if (!room) return;

    // Terminer le vote et calculer les résultats
    const voteResults = room.endVote();

    if (voteResults) {
        // Envoyer les résultats à tous les joueurs
        io.to(roomId).emit("vote-ended", voteResults);

        logger.success(
            `Vote terminé dans ${roomId} - ${
                voteResults.voteCorrect ? "✅ Correct" : "❌ Incorrect"
            }`
        );
        logger.info(
            `Éliminé: ${voteResults.eliminatedPlayer.username} (était ${
                voteResults.eliminatedPlayer.wasImpostor ? "intrus" : "normal"
            })`
        );

        // Si il y a un gagnant, mettre à jour l'état
        if (voteResults.winner) {
            logger.success(
                `🏆 Victoire de ${voteResults.winner.username} avec ${voteResults.winner.score} points !`
            );
        }
    }
}
