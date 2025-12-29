// server/index.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from "./src/socket/socketHandler.js";
import logger from "./src/utils/logger.js";

const app = express();
const httpServer = createServer(app);

// ✅ Configuration CORS pour développement réseau local
const corsOptions = {
    origin: (origin, callback) => {
        // Autoriser les requêtes sans origin (comme les apps mobiles)
        // ou depuis localhost et le réseau local
        if (
            !origin ||
            origin.startsWith("http://localhost") ||
            origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}/)
        ) {
            callback(null, true);
        } else {
            callback(new Error("Non autorisé par CORS"));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuration Socket.IO
const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ["websocket", "polling"],
    allowEIO3: true,
});

// Routes Express basiques
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/status", (req, res) => {
    res.json({
        server: "The Impostor Server",
        version: "1.0.0",
        status: "running",
    });
});

// Setup des gestionnaires Socket.IO
setupSocketHandlers(io);

// Démarrage du serveur
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, "0.0.0.0", () => {
    logger.success(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📡 Socket.IO prêt pour les connexions`);
    logger.info(`🌐 Accessible sur le réseau local`);

    // ✅ Ajoute ces logs pour debug
    const { address } = httpServer.address();
    logger.info(`🔗 Écoute sur: ${address}:${PORT}`);
});

// Gestion des erreurs
process.on("uncaughtException", (error) => {
    logger.error("Exception non capturée:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Promesse rejetée non gérée:", reason);
});
