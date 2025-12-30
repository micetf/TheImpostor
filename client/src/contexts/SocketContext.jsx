// client/src/contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { CONFIG } from "../utils/constants";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);
    const isInitialized = useRef(false); // ⬅️ Flag pour éviter double init

    useEffect(() => {
        // ⬅️ Protection contre le double montage React StrictMode
        if (isInitialized.current) {
            console.log("⚠️  Socket déjà initialisé, on ignore ce montage");
            return;
        }

        isInitialized.current = true;
        console.log(`🔗 Tentative de connexion à: ${CONFIG.SERVER_URL}`);

        // Créer UNE SEULE connexion Socket.IO pour toute l'app
        socketRef.current = io(CONFIG.SERVER_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10,
            timeout: 20000,
            transports: ["websocket", "polling"], // Fallback en polling
            upgrade: true,
            rememberUpgrade: true,
            path: "/socket.io/",
            // ⬅️ Force close on unload pour éviter les connexions zombies
            closeOnBeforeunload: true,
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("✅ Connecté au serveur");
            console.log("   - Socket ID:", socket.id);
            console.log("   - Transport:", socket.io.engine.transport.name);
            console.log("   - URL:", CONFIG.SERVER_URL);
            setIsConnected(true);
            setError(null);
        });

        socket.on("disconnect", (reason) => {
            console.log("❌ Déconnecté du serveur");
            console.log("   - Raison:", reason);
            setIsConnected(false);

            // Analyser la raison de déconnexion
            if (reason === "io server disconnect") {
                console.warn("⚠️  Le serveur a fermé la connexion");
            } else if (reason === "io client disconnect") {
                console.warn("⚠️  Déconnexion volontaire du client");
            } else if (reason === "ping timeout") {
                console.warn("⚠️  Timeout - pas de réponse du serveur");
            } else if (reason === "transport close") {
                console.warn(
                    "⚠️  Transport fermé - tentative de reconnexion..."
                );
            } else if (reason === "transport error") {
                console.warn(
                    "⚠️  Erreur de transport - tentative de reconnexion..."
                );
            }
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Erreur de connexion");
            console.error("   - Message:", err.message);
            console.error("   - Type:", err.type);
            console.error("   - Description:", err.description);

            setError(`Connexion impossible: ${err.message}`);
            setIsConnected(false);
        });

        // Événement : upgrade de transport
        socket.io.engine.on("upgrade", (transport) => {
            console.log("⬆️  Upgrade du transport vers:", transport.name);
        });

        // Événements de debug
        socket.io.on("error", (error) => {
            console.error("❌ Socket.IO error:", error);
        });

        socket.io.on("reconnect_attempt", (attemptNumber) => {
            console.log(`🔄 Tentative de reconnexion #${attemptNumber}...`);
        });

        socket.io.on("reconnect", (attemptNumber) => {
            console.log(
                `✅ Reconnexion réussie après ${attemptNumber} tentatives`
            );
            setIsConnected(true);
            setError(null);
        });

        socket.io.on("reconnect_failed", () => {
            console.error("❌ Échec de toutes les tentatives de reconnexion");
            setError("Impossible de se reconnecter au serveur");
        });

        // ⬅️ Nettoyage uniquement lors du vrai démontage
        return () => {
            // En développement avec StrictMode, on ne déconnecte pas
            // car le composant va se remonter immédiatement
            if (process.env.NODE_ENV === "production") {
                console.log(
                    "🧹 Nettoyage de la connexion Socket.IO (production)"
                );
                if (socket) {
                    socket.disconnect();
                }
                isInitialized.current = false;
            } else {
                console.log(
                    "🔄 Mode développement : Socket conservé pour le remontage"
                );
            }
        };
    }, []); // ⬅️ Dépendances vides = monte une seule fois

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
