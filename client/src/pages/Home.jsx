// client/src/pages/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { SOCKET_EVENTS } from "../utils/constants";

export default function Home() {
    const navigate = useNavigate();
    const { socket, isConnected, error } = useSocket();

    const [roomCode, setRoomCode] = useState("");
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCreateRoom = () => {
        if (!username.trim()) {
            setErrorMessage("Veuillez entrer un nom");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        socket.emit(SOCKET_EVENTS.CREATE_ROOM, (response) => {
            setIsLoading(false);

            if (response.success) {
                joinRoom(response.roomId, username.trim());
            } else {
                setErrorMessage(response.error || "Erreur lors de la création");
            }
        });
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();

        if (!username.trim()) {
            setErrorMessage("Veuillez entrer un nom");
            return;
        }

        if (!roomCode.trim()) {
            setErrorMessage("Veuillez entrer un code de salon");
            return;
        }

        joinRoom(roomCode.trim(), username.trim());
    };

    const joinRoom = (roomId, playerName) => {
        setIsLoading(true);
        setErrorMessage("");

        socket.emit(
            SOCKET_EVENTS.JOIN_ROOM,
            { roomId, username: playerName },
            (response) => {
                setIsLoading(false);

                if (response.success) {
                    navigate(`/lobby/${roomId}`, {
                        state: { username: playerName },
                    });
                } else {
                    setErrorMessage(
                        response.message || "Impossible de rejoindre"
                    );
                }
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-600 mb-2">
                        🎭 The Impostor
                    </h1>
                    <p className="text-gray-600">
                        Trouvez l'imposteur parmi vous !
                    </p>
                </div>

                <div className="mb-6">
                    {isConnected ? (
                        <div className="flex items-center justify-center text-green-600 text-sm">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                            Connecté au serveur
                        </div>
                    ) : (
                        <div className="flex items-center justify-center text-red-600 text-sm">
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                            {error ? `Erreur: ${error}` : "Connexion..."}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm mr-2">
                                1
                            </span>
                            <h3 className="font-semibold text-gray-800">
                                Choisissez votre nom
                            </h3>
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ex: Alice"
                            className="input-field"
                            maxLength={20}
                            disabled={!isConnected || isLoading}
                            autoFocus
                        />
                    </div>

                    <div
                        className={`space-y-4 transition-opacity ${
                            username.trim() ? "opacity-100" : "opacity-50"
                        }`}
                    >
                        <div className="flex items-center mb-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold text-sm mr-2">
                                2
                            </span>
                            <h3 className="font-semibold text-gray-800">
                                Créer ou rejoindre un salon
                            </h3>
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            disabled={
                                !isConnected || isLoading || !username.trim()
                            }
                            className="btn-primary w-full"
                        >
                            {isLoading
                                ? "Création..."
                                : "🎮 Créer un nouveau salon"}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    OU
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleJoinRoom} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code du salon
                                </label>
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) =>
                                        setRoomCode(
                                            e.target.value.toUpperCase().trim()
                                        )
                                    }
                                    placeholder="Collez le code ici"
                                    className="input-field font-mono text-center text-lg tracking-wider"
                                    maxLength={8}
                                    disabled={
                                        !isConnected ||
                                        isLoading ||
                                        !username.trim()
                                    }
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    💡 L'hôte peut copier le code avec le bouton
                                    📋
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    !isConnected ||
                                    isLoading ||
                                    !username.trim() ||
                                    !roomCode.trim()
                                }
                                className="btn-secondary w-full"
                            >
                                {isLoading
                                    ? "Connexion..."
                                    : "🚪 Rejoindre ce salon"}
                            </button>
                        </form>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            ❌ {errorMessage}
                        </div>
                    )}

                    {!username.trim() && (
                        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-lg text-sm">
                            👉 Commencez par entrer votre nom ci-dessus
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
