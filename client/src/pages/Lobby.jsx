// client/src/pages/Lobby.jsx
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { SOCKET_EVENTS, CONFIG } from "../utils/constants";

export default function Lobby() {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();

    const [room, setRoom] = useState(null);
    const [username] = useState(location.state?.username || "Joueur");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log("📡 Lobby monté, socket ID:", socket.id);

        // RE-JOINDRE la room Socket.IO pour s'assurer d'être à jour
        socket.emit(
            SOCKET_EVENTS.JOIN_ROOM,
            { roomId, username },
            (response) => {
                console.log("🔄 Re-join response:", response);
                if (response.success) {
                    setRoom(response.room);
                } else {
                    setError(response.message);
                }
            }
        );

        const handleRoomUpdate = (updatedRoom) => {
            console.log("🔄 Mise à jour du salon:", updatedRoom);
            setRoom(updatedRoom);
        };

        const handlePlayerDisconnected = ({ username: disconnectedUser }) => {
            console.log(`❌ ${disconnectedUser} s'est déconnecté`);
        };

        socket.on(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdate);
        socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, handlePlayerDisconnected);

        return () => {
            socket.off(SOCKET_EVENTS.ROOM_UPDATED, handleRoomUpdate);
            socket.off(
                SOCKET_EVENTS.PLAYER_DISCONNECTED,
                handlePlayerDisconnected
            );
        };
    }, [socket, isConnected, roomId, username]);

    /**
     * Copier le code du salon
     */
    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        alert("Code copié !");
    };

    /**
     * Quitter le salon
     */
    const handleLeave = () => {
        navigate("/");
    };

    // Trouver le joueur actuel
    const currentPlayer = room?.players.find((p) => p.username === username);
    const isHost = currentPlayer?.isHost || false;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-md">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">❌ {error}</p>
                        <button onClick={handleLeave} className="btn-primary">
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                {/* En-tête avec code du salon */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Salon de jeu
                        </h1>
                        <button
                            onClick={copyRoomCode}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-mono transition-colors"
                        >
                            📋 {roomId}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Joueurs:</span>
                            <span className="ml-2 font-semibold">
                                {room.playerCount} / {room.maxPlayers}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Statut:</span>
                            <span
                                className={`ml-2 font-semibold ${
                                    room.canStart
                                        ? "text-green-600"
                                        : "text-orange-600"
                                }`}
                            >
                                {room.canStart
                                    ? "Prêt"
                                    : `Min. ${CONFIG.MIN_PLAYERS} joueurs`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Liste des joueurs */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        👥 Joueurs ({room.playerCount})
                    </h2>

                    <div className="space-y-2">
                        {room.players.map((player) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                    player.username === username
                                        ? "bg-primary-50 border-2 border-primary-300"
                                        : "bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {player.username}
                                            {player.username === username && (
                                                <span className="ml-2 text-xs text-primary-600">
                                                    (Vous)
                                                </span>
                                            )}
                                        </p>
                                        {player.isHost && (
                                            <p className="text-xs text-gray-600">
                                                👑 Hôte
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500">
                                    Score: {player.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {isHost && (
                        <button
                            disabled={!room.canStart}
                            className="btn-primary flex-1"
                        >
                            🎮 Démarrer la partie
                        </button>
                    )}

                    <button onClick={handleLeave} className="btn-secondary">
                        🚪 Quitter
                    </button>
                </div>

                {/* Message pour l'hôte */}
                {isHost && !room.canStart && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
                        ⏳ En attente de joueurs... (minimum{" "}
                        {CONFIG.MIN_PLAYERS})
                    </div>
                )}

                {/* Message pour les joueurs */}
                {!isHost && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                        ⏳ En attente que l'hôte démarre la partie...
                    </div>
                )}
            </div>
        </div>
    );
}
