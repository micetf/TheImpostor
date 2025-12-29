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
            phase: "waiting", // waiting, playing, voting, results, ended
            currentRound: 0,
            votes: new Map(), // voterId -> targetId
            votedPlayers: new Set(), // Set des IDs qui ont voté
            voteInitiator: null,
            firstSpeaker: null,
            voteTimer: null,
            voteEndTime: null,
            winner: null,
        };
        this.history = [];

        // Constantes
        this.VOTE_DURATION = 30; // secondes
        this.WINNING_SCORE = 10;
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
     * Initie une phase de vote
     * @param {string} initiatorId - ID du socket du joueur qui initie le vote
     * @returns {object} - Résultat de l'initiation
     */
    initiateVote(initiatorId) {
        // Vérifications
        if (this.gameState.phase !== "playing") {
            return {
                success: false,
                message:
                    "Le vote ne peut être initié que pendant la phase de jeu",
            };
        }

        const initiator = this.findPlayer(initiatorId);
        if (!initiator) {
            return {
                success: false,
                message: "Joueur introuvable",
            };
        }

        // Réinitialiser les votes
        this.gameState.votes.clear();
        this.gameState.votedPlayers.clear();
        this.gameState.voteInitiator = initiatorId;
        this.gameState.phase = "voting";

        // Calculer l'heure de fin du vote (timestamp)
        this.gameState.voteEndTime = Date.now() + this.VOTE_DURATION * 1000;

        console.log(`[Room ${this.id}] Vote initié par ${initiator.username}`);

        return {
            success: true,
            message: "Vote initié",
            initiatorUsername: initiator.username,
            duration: this.VOTE_DURATION,
            endTime: this.gameState.voteEndTime,
        };
    }

    /**
     * Enregistre le vote d'un joueur
     * @param {string} voterId - ID du socket du votant
     * @param {string} targetId - ID du socket du joueur désigné
     * @returns {object} - Résultat de l'enregistrement
     */
    castVote(voterId, targetId) {
        // Vérifications
        if (this.gameState.phase !== "voting") {
            return {
                success: false,
                message: "Aucun vote en cours",
            };
        }

        const voter = this.findPlayer(voterId);
        const target = this.findPlayer(targetId);

        if (!voter || !target) {
            return {
                success: false,
                message: "Joueur introuvable",
            };
        }

        // Vérifier que le joueur n'a pas déjà voté
        if (this.gameState.votedPlayers.has(voterId)) {
            return {
                success: false,
                message: "Vous avez déjà voté",
            };
        }

        // Enregistrer le vote
        this.gameState.votes.set(voterId, targetId);
        this.gameState.votedPlayers.add(voterId);

        console.log(
            `[Room ${this.id}] ${voter.username} vote pour ${target.username}`
        );
        console.log(
            `[Room ${this.id}] Votes: ${this.gameState.votedPlayers.size}/${this.players.length}`
        );

        return {
            success: true,
            message: "Vote enregistré",
            voterUsername: voter.username,
            targetUsername: target.username,
            votesCount: this.gameState.votedPlayers.size,
            totalPlayers: this.players.length,
        };
    }

    /**
     * Termine le vote et calcule les résultats
     * @returns {object} - Résultats du vote avec attribution des points
     */
    endVote() {
        if (this.gameState.phase !== "voting") {
            return {
                success: false,
                message: "Aucun vote en cours",
            };
        }

        // Trouver le véritable intrus
        const realImpostor = this.players.find((p) => p.isImpostor);

        if (!realImpostor) {
            console.error(`[Room ${this.id}] ERREUR: Aucun intrus trouvé !`);
            return {
                success: false,
                message: "Erreur système: intrus introuvable",
            };
        }

        // Compter les votes pour chaque joueur
        const voteCounts = new Map();
        this.players.forEach((p) => {
            voteCounts.set(p.id, 0);
        });

        this.gameState.votes.forEach((targetId) => {
            voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
        });

        // Trouver le joueur avec le plus de votes
        let maxVotes = 0;
        let designatedImpostorId = null;

        voteCounts.forEach((count, playerId) => {
            if (count > maxVotes) {
                maxVotes = count;
                designatedImpostorId = playerId;
            }
        });

        const designatedImpostor = this.findPlayer(designatedImpostorId);
        const voteCorrect = designatedImpostorId === realImpostor.id;

        // Attribution des points selon les règles
        const pointsChanges = [];

        this.players.forEach((player) => {
            const hasVoted = this.gameState.votedPlayers.has(player.id);
            const isInitiator = player.id === this.gameState.voteInitiator;
            const votedCorrectly =
                this.gameState.votes.get(player.id) === realImpostor.id;

            let points = 0;
            let reason = "";

            if (!hasVoted) {
                // N'a pas voté
                if (isInitiator) {
                    points = -2;
                    reason = "Initiateur qui ne vote pas";
                } else {
                    points = -1;
                    reason = "N'a pas voté";
                }
            } else if (isInitiator) {
                // Initiateur qui vote
                if (voteCorrect) {
                    points = 2;
                    reason = "Initiateur avec vote correct";
                } else {
                    points = -2;
                    reason = "Initiateur avec vote incorrect";
                }
            } else {
                // Joueur normal qui vote
                if (votedCorrectly) {
                    points = 1;
                    reason = "Vote correct";
                } else {
                    points = -1;
                    reason = "Vote incorrect";
                }
            }

            player.addPoints(points);

            pointsChanges.push({
                playerId: player.id,
                username: player.username,
                points: points,
                newScore: player.score,
                reason: reason,
            });

            console.log(
                `[Room ${this.id}] ${player.username}: ${
                    points > 0 ? "+" : ""
                }${points} (${reason}) → Score: ${player.score}`
            );
        });

        // Déterminer les votes pour chaque joueur (pour affichage)
        const voteDetails = [];
        this.players.forEach((player) => {
            const votersForThisPlayer = Array.from(
                this.gameState.votes.entries()
            )
                .filter(([, targetId]) => targetId === player.id)
                .map(
                    ([voterId]) => this.findPlayer(voterId)?.username || "???"
                );

            voteDetails.push({
                playerId: player.id,
                username: player.username,
                voteCount: voteCounts.get(player.id) || 0,
                voters: votersForThisPlayer,
            });
        });

        // Vérifier s'il y a un gagnant
        const winner = this.players.find((p) => p.score >= this.WINNING_SCORE);

        // Enregistrer dans l'historique
        this.history.push({
            round: this.gameState.currentRound,
            pair: this.currentPair,
            impostor: realImpostor.username,
            voteCorrect: voteCorrect,
            designated: designatedImpostor?.username || "Personne",
            pointsChanges: pointsChanges,
        });

        // Passer à la phase résultats
        this.gameState.phase = winner ? "ended" : "results";

        if (winner) {
            this.gameState.winner = winner.id;
            console.log(`[Room ${this.id}] 🏆 ${winner.username} a gagné !`);
        }

        const results = {
            success: true,
            voteCorrect: voteCorrect,
            realImpostor: {
                id: realImpostor.id,
                username: realImpostor.username,
                word: realImpostor.currentWord,
            },
            designatedImpostor: designatedImpostor
                ? {
                      id: designatedImpostor.id,
                      username: designatedImpostor.username,
                  }
                : null,
            teamWord: this.currentPair.team,
            intruderWord: this.currentPair.intruder,
            voteDetails: voteDetails,
            pointsChanges: pointsChanges,
            players: this.players.map((p) => ({
                id: p.id,
                username: p.username,
                score: p.score,
                votedFor: this.gameState.votes.has(p.id)
                    ? this.findPlayer(this.gameState.votes.get(p.id))?.username
                    : null,
            })),
            winner: winner
                ? {
                      id: winner.id,
                      username: winner.username,
                      score: winner.score,
                  }
                : null,
        };

        console.log(
            `[Room ${this.id}] Vote terminé - ${
                voteCorrect ? "Correct" : "Incorrect"
            }`
        );

        return results;
    }

    /**
     * Prépare le prochain tour
     * @param {Array} wordPairs - Tableau des paires de mots
     * @returns {object} - État du nouveau tour
     */
    startNextRound(wordPairs) {
        if (this.gameState.phase !== "results") {
            return {
                success: false,
                message: "Impossible de démarrer un nouveau tour maintenant",
            };
        }

        // Réinitialiser les joueurs
        this.players.forEach((p) => p.resetForNewRound());

        // Réinitialiser l'état du vote
        this.gameState.votes.clear();
        this.gameState.votedPlayers.clear();
        this.gameState.voteInitiator = null;
        this.gameState.voteEndTime = null;

        // Nouvelle paire de mots
        const randomIndex = Math.floor(Math.random() * wordPairs.length);
        this.currentPair = {
            team: wordPairs[randomIndex][0],
            intruder: wordPairs[randomIndex][1],
        };

        // Nouvel intrus
        const randomIntruderIndex = Math.floor(
            Math.random() * this.players.length
        );

        this.players.forEach((player, index) => {
            if (index === randomIntruderIndex) {
                player.currentWord = this.currentPair.intruder;
                player.isImpostor = true;
            } else {
                player.currentWord = this.currentPair.team;
                player.isImpostor = false;
            }
        });

        // Nouveau premier orateur
        const randomSpeakerIndex = Math.floor(
            Math.random() * this.players.length
        );
        this.gameState.firstSpeaker = this.players[randomSpeakerIndex].id;
        this.gameState.phase = "playing";
        this.gameState.currentRound += 1;

        console.log(
            `[Room ${this.id}] Nouveau tour ${this.gameState.currentRound} démarré`
        );

        return {
            success: true,
            message: "Nouveau tour démarré",
            round: this.gameState.currentRound,
            firstSpeaker: this.gameState.firstSpeaker,
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
            voteEndTime: this.gameState.voteEndTime,
            votesCount: this.gameState.votedPlayers.size,
            totalPlayers: this.players.length,
            hasVoted: playerId
                ? this.gameState.votedPlayers.has(playerId)
                : false,
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
