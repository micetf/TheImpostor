// client/src/pages/Game.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

/**
 * Page de jeu - Affiche le mot du joueur et l'état de la partie
 */
export default function Game() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();

    const [gameState, setGameState] = useState({
        phase: "loading",
        currentRound: 0,
        firstSpeaker: null,
        players: [],
    });
    const [myWord, setMyWord] = useState(null);
    // ❌ SUPPRIMÉ : const [isImpostor, setIsImpostor] = useState(null);
    const [error, setError] = useState("");

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
            // ❌ Le serveur ne transmet plus isImpostor
        };

        socket.on("game-started", handleGameStarted);
        socket.on("word-assigned", handleWordAssigned);

        return () => {
            socket.off("game-started", handleGameStarted);
            socket.off("word-assigned", handleWordAssigned);
        };
    }, [socket, isConnected]);

    // Vérifier si je suis le premier orateur
    const isFirstSpeaker = socket?.id === gameState.firstSpeaker;

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
                                Tour {gameState.currentRound}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Code salon</p>
                            <p className="font-mono text-lg font-bold text-primary-600">
                                {roomId}
                            </p>
                        </div>
                    </div>
                </div>

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
                                💡 Décrivez votre mot sans le dire explicitement
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
                                <p className="font-semibold">Votre objectif</p>
                                <p>
                                    Découvrir qui a un mot différent en écoutant
                                    les descriptions. Vous ne savez pas si VOUS
                                    avez le mot de la majorité !
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
                                    Décrivez votre mot avec des indices subtils.
                                    Écoutez attentivement les autres pour
                                    détecter l'intrus.
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

                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">🗳️</span>
                            <div>
                                <p className="font-semibold">Lancer le vote</p>
                                <p>
                                    Quand vous pensez avoir identifié l'intrus,
                                    cliquez sur "Initier le vote".
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-blue-800">
                                    Règle importante
                                </p>
                                <p className="text-blue-700">
                                    Un joueur a un mot différent mais ne le sait
                                    pas. Ce pourrait être vous !
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        className="btn-primary flex-1"
                        onClick={() => {
                            // TODO: Implémenter dans Sprint 2
                            alert("Fonctionnalité du Sprint 2 (vote)");
                        }}
                    >
                        🗳️ Initier le vote
                    </button>

                    <button
                        onClick={() => navigate(`/lobby/${roomId}`)}
                        className="btn-secondary"
                    >
                        🚪 Quitter
                    </button>
                </div>

                {/* Note de développement */}
                <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-xs">
                    <p className="font-semibold mb-1">
                        🔧 Sprint 1 - Test réussi ✅
                    </p>
                    <p>✅ Distribution des mots opérationnelle</p>
                    <p>
                        ✅ Aucun joueur ne connaît son statut (intrus ou normal)
                    </p>
                    <p>⏳ Le système de vote sera implémenté au Sprint 2</p>
                </div>
            </div>
        </div>
    );
}
