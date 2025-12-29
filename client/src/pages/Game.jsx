// client/src/pages/Game.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import VotePanel from "../components/VotePanel";
import Results from "../components/Results";

/**
 * Page de jeu principale - Gère les 3 phases : playing, voting, results
 * @component
 * @returns {JSX.Element}
 */
export default function Game() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { socket, isConnected } = useSocket();

    const [gameState, setGameState] = useState({
        phase: "loading",
        currentRound: 0,
        firstSpeaker: null,
        players: [],
        voteEndTime: null,
        votesCount: 0,
        totalPlayers: 0,
        hasVoted: false,
    });
    const [myWord, setMyWord] = useState(null);
    const [username] = useState(location.state?.username || "Joueur");
    const [voteResults, setVoteResults] = useState(null);
    const [error, setError] = useState("");
    const [votesProgress, setVotesProgress] = useState({
        count: 0,
        total: 0,
    });

    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log("🎮 Page Game montée, socket ID:", socket.id);

        // Écouter l'événement de démarrage de partie
        const handleGameStarted = (data) => {
            console.log("🎮 Partie démarrée:", data);
            setGameState((prev) => ({
                ...prev,
                phase: data.phase,
                currentRound: data.currentRound,
                firstSpeaker: data.firstSpeaker,
            }));
        };

        // Écouter l'attribution du mot personnel
        const handleWordAssigned = (data) => {
            console.log("🎯 Mot reçu:", data.word);
            setMyWord(data.word);
        };

        // Écouter le début d'un vote
        const handleVoteStarted = (data) => {
            console.log("🗳️ Vote démarré:", data);
            setGameState((prev) => ({
                ...prev,
                phase: "voting",
                voteEndTime: data.endTime,
                players: data.players,
                hasVoted: false,
                votesCount: 0,
                totalPlayers: data.players.length,
            }));
            setVotesProgress({
                count: 0,
                total: data.players.length,
            });
        };

        // Écouter l'enregistrement d'un vote
        const handleVoteRegistered = (data) => {
            console.log("✅ Vote enregistré:", data);
            setVotesProgress({
                count: data.votesCount,
                total: data.totalPlayers,
            });
        };

        // Écouter la fin du vote
        const handleVoteEnded = (results) => {
            console.log("🏁 Résultats du vote:", results);
            setVoteResults(results);
            setGameState((prev) => ({
                ...prev,
                phase: results.winner ? "ended" : "results",
            }));
        };

        // Écouter le début d'un nouveau tour
        const handleNewRound = (data) => {
            console.log("🔄 Nouveau tour:", data);
            setGameState((prev) => ({
                ...prev,
                phase: "playing",
                currentRound: data.round,
                firstSpeaker: data.firstSpeaker,
                hasVoted: false,
                votesCount: 0,
            }));
            setVoteResults(null);
        };

        socket.on("game-started", handleGameStarted);
        socket.on("word-assigned", handleWordAssigned);
        socket.on("vote-started", handleVoteStarted);
        socket.on("vote-registered", handleVoteRegistered);
        socket.on("vote-ended", handleVoteEnded);
        socket.on("new-round-started", handleNewRound);

        return () => {
            socket.off("game-started", handleGameStarted);
            socket.off("word-assigned", handleWordAssigned);
            socket.off("vote-started", handleVoteStarted);
            socket.off("vote-registered", handleVoteRegistered);
            socket.off("vote-ended", handleVoteEnded);
            socket.off("new-round-started", handleNewRound);
        };
    }, [socket, isConnected]);

    /**
     * Initie un vote
     */
    const handleInitiateVote = () => {
        socket.emit("initiate-vote", roomId, (response) => {
            console.log("📡 Réponse initiate-vote:", response);
            if (!response.success) {
                alert(
                    response.message || "Erreur lors de l'initiation du vote"
                );
            }
        });
    };

    /**
     * Enregistre un vote pour un joueur
     * @param {string} targetId - ID du joueur désigné
     */
    const handleCastVote = (targetId) => {
        socket.emit("cast-vote", { roomId, targetId }, (response) => {
            console.log("📡 Réponse cast-vote:", response);
            if (response.success) {
                setGameState((prev) => ({
                    ...prev,
                    hasVoted: true,
                }));
            } else {
                alert(
                    response.message ||
                        "Erreur lors de l'enregistrement du vote"
                );
            }
        });
    };

    /**
     * Démarre le tour suivant (hôte uniquement)
     */
    const handleNextRound = () => {
        socket.emit("start-next-round", roomId, (response) => {
            console.log("📡 Réponse start-next-round:", response);
            if (!response.success) {
                alert(response.message || "Erreur lors du démarrage du tour");
            }
        });
    };

    // Vérifier si je suis le premier orateur
    const isFirstSpeaker = socket?.id === gameState.firstSpeaker;

    // Vérifier si je suis l'hôte
    const isHost =
        gameState.players.find((p) => p.id === socket?.id)?.isHost || false;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-md">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">❌ {error}</p>
                        <button
                            onClick={() => navigate(`/lobby/${roomId}`)}
                            className="btn-primary"
                        >
                            Retour au lobby
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!myWord) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">
                    ⏳ Chargement de votre mot...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="max-w-4xl mx-auto">
                {/* En-tête de partie */}
                <div className="card mb-6 bg-white/90 backdrop-blur">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                🎮 Partie en cours
                            </h1>
                            <p className="text-sm text-gray-600">
                                Tour {gameState.currentRound} -{" "}
                                {gameState.phase === "playing" &&
                                    "Phase de jeu"}
                                {gameState.phase === "voting" &&
                                    "Phase de vote"}
                                {gameState.phase === "results" && "Résultats"}
                                {gameState.phase === "ended" &&
                                    "Partie terminée"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Code salon</p>
                            <p className="font-mono text-lg font-bold text-primary-600">
                                {roomId}
                            </p>
                        </div>
                    </div>

                    {/* Progression des votes (uniquement pendant la phase de vote) */}
                    {gameState.phase === "voting" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-blue-800">
                                    Progression des votes
                                </span>
                                <span className="text-sm text-blue-600">
                                    {votesProgress.count} /{" "}
                                    {votesProgress.total}
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            (votesProgress.count /
                                                votesProgress.total) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Phase de jeu : Affichage du mot et bouton vote */}
                {gameState.phase === "playing" && (
                    <>
                        {/* Carte du mot */}
                        <div className="card mb-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                            <div className="text-center py-8">
                                <p className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-90">
                                    ✨ Votre mot
                                </p>
                                <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
                                    {myWord}
                                </h2>
                                <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-3 inline-block">
                                    <p className="text-sm">
                                        💡 Décrivez votre mot sans le dire
                                        explicitement
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="card mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                📋 Instructions
                            </h3>
                            <div className="space-y-3 text-sm text-gray-700">
                                <div className="flex items-start space-x-3">
                                    <span className="text-2xl">🤔</span>
                                    <div>
                                        <p className="font-semibold">
                                            Votre objectif
                                        </p>
                                        <p>
                                            Découvrir qui a un mot différent en
                                            écoutant les descriptions. Vous ne
                                            savez pas si VOUS avez le mot de la
                                            majorité !
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <span className="text-2xl">💬</span>
                                    <div>
                                        <p className="font-semibold">
                                            Phase d'échange à l'oral
                                        </p>
                                        <p>
                                            Décrivez votre mot avec des indices
                                            subtils. Écoutez attentivement les
                                            autres pour détecter l'intrus.
                                        </p>
                                    </div>
                                </div>

                                {isFirstSpeaker && (
                                    <div className="flex items-start space-x-3 bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
                                        <span className="text-2xl">🎤</span>
                                        <div>
                                            <p className="font-bold text-yellow-800">
                                                Vous êtes le premier orateur !
                                            </p>
                                            <p className="text-yellow-700">
                                                Commencez par décrire votre mot.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bouton pour initier le vote */}
                        <button
                            className="btn-primary w-full mb-4"
                            onClick={handleInitiateVote}
                        >
                            🗳️ Initier le vote
                        </button>

                        <button
                            onClick={() => navigate(`/lobby/${roomId}`)}
                            className="btn-secondary w-full"
                        >
                            🚪 Quitter
                        </button>
                    </>
                )}

                {/* Phase de vote */}
                {gameState.phase === "voting" && (
                    <VotePanel
                        players={gameState.players}
                        mySocketId={socket.id}
                        voteEndTime={gameState.voteEndTime}
                        hasVoted={gameState.hasVoted}
                        onVote={handleCastVote}
                    />
                )}

                {/* Phase résultats */}
                {(gameState.phase === "results" ||
                    gameState.phase === "ended") &&
                    voteResults && (
                        <Results
                            results={voteResults}
                            isHost={isHost}
                            onNextRound={handleNextRound}
                        />
                    )}
            </div>
        </div>
    );
}
