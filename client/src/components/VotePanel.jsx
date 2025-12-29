// client/src/components/VotePanel.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Panneau de vote permettant aux joueurs de désigner l'intrus
 * Affiche la liste des joueurs et un timer de 30 secondes
 *
 * @component
 * @param {Object} props
 * @param {Array} props.players - Liste des joueurs à afficher
 * @param {string} props.mySocketId - ID du socket du joueur actuel
 * @param {number} props.voteEndTime - Timestamp de fin du vote
 * @param {boolean} props.hasVoted - Indique si le joueur a déjà voté
 * @param {Function} props.onVote - Callback appelé lors d'un vote
 * @returns {JSX.Element}
 */
export default function VotePanel({
    players,
    mySocketId,
    voteEndTime,
    hasVoted,
    onVote,
}) {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(30);

    // Mise à jour du timer
    useEffect(() => {
        if (!voteEndTime) return;

        const interval = setInterval(() => {
            const remaining = Math.max(
                0,
                Math.floor((voteEndTime - Date.now()) / 1000)
            );
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [voteEndTime]);

    /**
     * Gère le clic sur un joueur pour le sélectionner
     * @param {string} playerId - ID du joueur sélectionné
     */
    const handleSelectPlayer = (playerId) => {
        if (hasVoted || playerId === mySocketId) return;
        setSelectedPlayer(playerId);
    };

    /**
     * Confirme le vote pour le joueur sélectionné
     */
    const handleConfirmVote = () => {
        if (!selectedPlayer || hasVoted) return;
        onVote(selectedPlayer);
    };

    // Calcul de la couleur de la barre de progression
    const getTimerColor = () => {
        if (timeRemaining > 20) return "bg-green-500";
        if (timeRemaining > 10) return "bg-yellow-500";
        return "bg-red-500";
    };

    const timerPercentage = (timeRemaining / 30) * 100;

    return (
        <div className="card mb-6">
            {/* Timer */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">
                        ⏱️ Temps restant
                    </h3>
                    <span
                        className={`text-2xl font-bold ${
                            timeRemaining <= 10
                                ? "text-red-600 animate-pulse"
                                : "text-gray-800"
                        }`}
                    >
                        {timeRemaining}s
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getTimerColor()}`}
                        style={{ width: `${timerPercentage}%` }}
                    />
                </div>
            </div>

            {/* Instruction */}
            <div className="mb-4">
                {hasVoted ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                        ✅ Vote enregistré ! En attente des autres joueurs...
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                        <p className="font-semibold">
                            🗳️ Votez pour désigner l'intrus
                        </p>
                        <p className="text-sm">
                            Cliquez sur un joueur puis confirmez votre choix
                        </p>
                    </div>
                )}
            </div>

            {/* Liste des joueurs */}
            <div className="space-y-2 mb-4">
                {players
                    .filter((p) => p.id !== mySocketId)
                    .map((player) => (
                        <button
                            key={player.id}
                            onClick={() => handleSelectPlayer(player.id)}
                            disabled={hasVoted}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                                selectedPlayer === player.id
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-gray-200 hover:border-primary-300"
                            } ${
                                hasVoted
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-800">
                                            {player.username}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Score: {player.score}
                                        </p>
                                    </div>
                                </div>
                                {selectedPlayer === player.id && (
                                    <div className="text-primary-600 text-2xl">
                                        ✓
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
            </div>

            {/* Bouton de confirmation */}
            {!hasVoted && (
                <button
                    onClick={handleConfirmVote}
                    disabled={!selectedPlayer}
                    className="btn-primary w-full"
                >
                    {selectedPlayer
                        ? `Confirmer le vote pour ${
                              players.find((p) => p.id === selectedPlayer)
                                  ?.username
                          }`
                        : "Sélectionnez un joueur"}
                </button>
            )}
        </div>
    );
}

VotePanel.propTypes = {
    players: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            score: PropTypes.number.isRequired,
        })
    ).isRequired,
    mySocketId: PropTypes.string.isRequired,
    voteEndTime: PropTypes.number.isRequired,
    hasVoted: PropTypes.bool.isRequired,
    onVote: PropTypes.func.isRequired,
};
