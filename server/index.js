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
        console.log(`🔍 CORS check - Origin: ${origin || "aucune"}`);

        // Autoriser les requêtes sans origin (comme les apps mobiles)
        // ou depuis localhost et le réseau local
        if (
            !origin ||
            origin.startsWith("http://localhost") ||
            origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}/)
        ) {
            console.log(`✅ CORS autorisé pour: ${origin || "sans origin"}`);
            callback(null, true);
        } else {
            console.error(`❌ CORS refusé pour: ${origin}`);
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
    // ⬅️ AJOUTE CES OPTIONS
    pingTimeout: 60000, // 60 secondes avant timeout
    pingInterval: 25000, // Ping toutes les 25 secondes
    upgradeTimeout: 10000, // 10 secondes pour upgrade WebSocket
    transports: ["polling", "websocket"], // Ordre des transports
});

// ⬅️ AJOUTE CES LOGS DE DEBUG
io.engine.on("connection_error", (err) => {
    logger.error("❌ Erreur de connexion Engine.IO:");
    logger.error(`   - Code: ${err.code}`);
    logger.error(`   - Message: ${err.message}`);
    logger.error(`   - Context: ${JSON.stringify(err.context)}`);
});

io.on("connection", (socket) => {
    logger.success(`🔌 Connexion établie: ${socket.id}`);
    logger.info(`   - Transport: ${socket.conn.transport.name}`);
    logger.info(`   - IP: ${socket.handshake.address}`);
    logger.info(
        `   - Headers: ${JSON.stringify(socket.handshake.headers.origin)}`
    );

    // ⬅️ Log lors de l'upgrade vers WebSocket
    socket.conn.on("upgrade", (transport) => {
        logger.info(`⬆️  Socket ${socket.id} upgraded vers: ${transport.name}`);
    });

    socket.on("disconnect", (reason) => {
        logger.warn(`🔌 Déconnexion ${socket.id}: ${reason}`);
    });

    socket.on("error", (error) => {
        logger.error(`❌ Erreur socket ${socket.id}:`, error);
    });
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
