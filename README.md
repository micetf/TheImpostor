# The Impostor - Jeu Multijoueur

## 📦 Installation

### 1. Extraire l'archive

```bash
tar -xzf TheImpostor.tar.gz
cd TheImpostor
```

### 2. Ajouter le fichier wordPairs.js complet

⚠️ **ACTION REQUISE** : Copiez votre fichier `wordPairs.js` dans `server/src/data/`

```bash
# Exemple si le fichier est dans votre dossier Téléchargements
cp ~/Téléchargements/wordPairs.js server/src/data/wordPairs.js
```

Ensuite, modifiez la dernière ligne du fichier pour utiliser ESM :

-   Ouvrez `server/src/data/wordPairs.js`
-   Remplacez `module.exports = wordPairs;` par `export default wordPairs;`

### 3. Installer les dépendances du serveur

```bash
cd server
pnpm install
```

### 4. Démarrer le serveur

```bash
pnpm run dev
```

Vous devriez voir :

```
✅ Serveur démarré sur le port 3001
ℹ️  Socket.IO prêt pour les connexions
🌐 Client attendu sur http://localhost:5173
```

## 🧪 Tester l'API

```bash
# Tester le health check
curl http://localhost:3001/health

# Tester le statut
curl http://localhost:3001/api/status
```

## 📂 Structure du projet

```
TheImpostor/
├── README.md
├── pnpm-workspace.yaml
├── package.json
├── client/                  (à venir - Étape 2)
└── server/
    ├── src/
    │   ├── game/
    │   │   ├── GameManager.js    ✅ Gestionnaire central
    │   │   ├── Room.js            ✅ Logique salon
    │   │   └── Player.js          ✅ Logique joueur
    │   ├── socket/
    │   │   └── socketHandler.js   ✅ Événements Socket.IO
    │   ├── data/
    │   │   └── wordPairs.js       ⚠️  À ajouter manuellement
    │   └── utils/
    │       └── logger.js          ✅ Logger
    ├── package.json
    └── index.js
```

## 🎯 Événements Socket.IO disponibles

| Événement             | Description                 |
| --------------------- | --------------------------- |
| `create-room`         | Créer un salon              |
| `join-room`           | Rejoindre un salon          |
| `get-room-info`       | Obtenir infos d'un salon    |
| `list-rooms`          | Lister tous les salons      |
| `room-updated`        | Mise à jour du salon (émis) |
| `player-disconnected` | Joueur déconnecté (émis)    |

## 🚀 Prochaines étapes

-   **Étape 2** : Client React + Tailwind CSS
-   **Étape 3** : Distribution des mots et début de partie
-   **Étape 4** : Système de vote
-   **Étape 5** : Scores et fin de partie

## ⚙️ Configuration

-   **Port serveur :** 3001
-   **Max joueurs/salon :** 10
-   **Score de victoire :** 10 points
-   **Fenêtre de reconnexion :** 2 minutes
