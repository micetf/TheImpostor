// client/src/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { CONFIG } from "../utils/constants";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Créer UNE SEULE connexion Socket.IO pour toute l'app
        socketRef.current = io(CONFIG.SERVER_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("✅ Connecté au serveur:", socket.id);
            setIsConnected(true);
            setError(null);
        });

        socket.on("disconnect", (reason) => {
            console.log("❌ Déconnecté du serveur:", reason);
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Erreur de connexion:", err.message);
            setError(err.message);
            setIsConnected(false);
        });

        // Nettoyage à la destruction de l'app
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider
            value={{ socket: socketRef.current, isConnected, error }}
        >
            {children}
        </SocketContext.Provider>
    );
}

// Hook pour utiliser le socket
export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket doit être utilisé dans un SocketProvider");
    }
    return context;
}
