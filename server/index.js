// server/index.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from "./src/socket/socketHandler.js";
import logger from "./src/utils/logger.js";

const app = express();
const httpServer = createServer(app);

// Configuration CORS pour Socket.IO et Express
const corsOptions = {
    origin: "http://localhost:5173", // URL du client Vite
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuration Socket.IO
const io = new Server(httpServer, {
    cors: corsOptions,
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

httpServer.listen(PORT, () => {
    logger.success(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📡 Socket.IO prêt pour les connexions`);
    logger.info(`🌐 Client attendu sur http://localhost:5173`);
});

// Gestion des erreurs
process.on("uncaughtException", (error) => {
    logger.error("Exception non capturée:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Promesse rejetée non gérée:", reason);
});
