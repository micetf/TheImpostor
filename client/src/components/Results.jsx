// client/src/components/Results.jsx
import PropTypes from "prop-types";

/**
 * Écran de résultats après un vote
 * Affiche l'intrus révélé, les points attribués, et le classement
 *
 * @component
 * @param {Object} props
 * @param {Object} props.results - Résultats du vote
 * @param {boolean} props.isHost - Si l'utilisateur est l'hôte
 * @param {Function} props.onNextRound - Callback pour démarrer le tour suivant
 * @returns {JSX.Element}
 */
export default function Results({ results, isHost, onNextRound }) {
    const {
        voteCorrect,
        realImpostor,
        designatedImpostor,
        teamWord,
        intruderWord,
        voteDetails,
        pointsChanges,
        players,
        winner,
    } = results;

    // Trier les joueurs par score décroissant
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-6">
            {/* Résultat global */}
            <div
                className={`card ${
                    voteCorrect
                        ? "bg-gradient-to-br from-green-500 to-green-700"
                        : "bg-gradient-to-br from-red-500 to-red-700"
                } text-white`}
            >
                <div className="text-center py-6">
                    <h2 className="text-3xl font-bold mb-4">
                        {voteCorrect
                            ? "✅ Vote correct !"
                            : "❌ Vote incorrect !"}
                    </h2>
                    <p className="text-lg opacity-90">
                        {voteCorrect
                            ? `L'intrus ${realImpostor.username} a été démasqué !`
                            : `${
                                  designatedImpostor?.username || "Personne"
                              } n'était pas l'intrus...`}
                    </p>
                </div>
            </div>

            {/* Révélation des mots */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    🎯 Révélation des mots
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-semibold uppercase mb-2">
                            Mot de l'équipe
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                            {teamWord}
                        </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-xs text-red-600 font-semibold uppercase mb-2">
                            Mot de l'intrus
                        </p>
                        <p className="text-2xl font-bold text-red-800">
                            {intruderWord}
                        </p>
                    </div>
                </div>
                <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-center">
                    <p className="font-semibold">
                        🎭 L'intrus était : {realImpostor.username}
                    </p>
                    <p className="text-sm">
                        (qui avait le mot "{realImpostor.word}")
                    </p>
                </div>
            </div>

            {/* Détail des votes */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    📊 Détail des votes
                </h3>
                <div className="space-y-2">
                    {voteDetails.map((detail) => (
                        <div
                            key={detail.playerId}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                detail.playerId === realImpostor.id
                                    ? "bg-red-50 border-2 border-red-300"
                                    : "bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {detail.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {detail.username}
                                        {detail.playerId ===
                                            realImpostor.id && (
                                            <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
                                                INTRUS
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {detail.voteCount} vote(s) reçu(s)
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary-600">
                                    {detail.voteCount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Attribution des points */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    💰 Attribution des points
                </h3>
                <div className="space-y-2">
                    {pointsChanges.map((change) => (
                        <div
                            key={change.playerId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {change.username}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {change.reason}
                                </p>
                            </div>
                            <div className="text-right">
                                <p
                                    className={`text-2xl font-bold ${
                                        change.points > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {change.points > 0 ? "+" : ""}
                                    {change.points}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Total: {change.newScore}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Classement actuel */}
            <div className="card">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    🏆 Classement actuel
                </h3>
                <div className="space-y-2">
                    {sortedPlayers.map((player, index) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                index === 0
                                    ? "bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300"
                                    : "bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                        index === 0
                                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                            : "bg-gradient-to-br from-gray-400 to-gray-600"
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <p className="font-semibold text-gray-800">
                                    {player.username}
                                    {index === 0 && (
                                        <span className="ml-2 text-yellow-600">
                                            👑
                                        </span>
                                    )}
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-primary-600">
                                {player.score}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Victoire ou tour suivant */}
            {winner ? (
                <div className="card bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                    <div className="text-center py-8">
                        <h2 className="text-4xl font-bold mb-4">
                            🎉 Victoire !
                        </h2>
                        <p className="text-2xl mb-2">{winner.username}</p>
                        <p className="text-lg opacity-90">
                            a atteint {winner.score} points !
                        </p>
                    </div>
                </div>
            ) : (
                isHost && (
                    <button
                        onClick={onNextRound}
                        className="btn-primary w-full"
                    >
                        ▶️ Tour suivant
                    </button>
                )
            )}

            {!isHost && !winner && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center">
                    ⏳ En attente que l'hôte lance le tour suivant...
                </div>
            )}
        </div>
    );
}

Results.propTypes = {
    results: PropTypes.shape({
        voteCorrect: PropTypes.bool.isRequired,
        realImpostor: PropTypes.shape({
            id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            word: PropTypes.string.isRequired,
        }).isRequired,
        designatedImpostor: PropTypes.shape({
            id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
        }),
        teamWord: PropTypes.string.isRequired,
        intruderWord: PropTypes.string.isRequired,
        voteDetails: PropTypes.arrayOf(
            PropTypes.shape({
                playerId: PropTypes.string.isRequired,
                username: PropTypes.string.isRequired,
                voteCount: PropTypes.number.isRequired,
                voters: PropTypes.arrayOf(PropTypes.string).isRequired,
            })
        ).isRequired,
        pointsChanges: PropTypes.arrayOf(
            PropTypes.shape({
                playerId: PropTypes.string.isRequired,
                username: PropTypes.string.isRequired,
                points: PropTypes.number.isRequired,
                newScore: PropTypes.number.isRequired,
                reason: PropTypes.string.isRequired,
            })
        ).isRequired,
        players: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                username: PropTypes.string.isRequired,
                score: PropTypes.number.isRequired,
            })
        ).isRequired,
        winner: PropTypes.shape({
            id: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            score: PropTypes.number.isRequired,
        }),
    }).isRequired,
    isHost: PropTypes.bool.isRequired,
    onNextRound: PropTypes.func.isRequired,
};
