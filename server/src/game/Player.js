// server/src/game/Player.js

/**
 * Représente un joueur dans le jeu
 */
class Player {
    constructor(socketId, username) {
        this.id = socketId;
        this.username = username;
        this.isHost = false;
        this.isAlive = true;
        this.score = 0;
        this.currentWord = null;
        this.isImpostor = false;
    }

    /**
     * Réinitialise l'état du joueur pour un nouveau tour
     */
    resetForNewRound() {
        this.currentWord = null;
        this.isImpostor = false;
    }

    /**
     * Ajoute des points au score du joueur
     * @param {number} points - Nombre de points à ajouter (peut être négatif)
     */
    addPoints(points) {
        this.score += points;
    }

    /**
     * Vérifie si le joueur a atteint le score de victoire
     * @param {number} winningScore - Score nécessaire pour gagner
     * @returns {boolean}
     */
    hasWon(winningScore = 10) {
        return this.score >= winningScore;
    }

    /**
     * Retourne une représentation sérialisable du joueur
     * @param {boolean} hideWord - Cache le mot si true (pour les autres joueurs)
     * @returns {object}
     */
    toJSON(hideWord = false) {
        return {
            id: this.id,
            username: this.username,
            isHost: this.isHost,
            isAlive: this.isAlive,
            score: this.score,
            currentWord: hideWord ? null : this.currentWord,
            isImpostor: hideWord ? null : this.isImpostor,
        };
    }
}

export default Player;
