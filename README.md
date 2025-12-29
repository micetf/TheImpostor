# The Impostor - Jeu Multijoueur

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)
![License](https://img.shields.io/badge/license-MIT-green)

Jeu multijoueur en temps réel inspiré du jeu "Undercover". Les joueurs reçoivent des mots et doivent identifier celui qui a un mot différent à travers des discussions et votes.

## 🎮 Concept du jeu

-   **Joueurs** : 3 à 10 par partie
-   **Principe** : Un joueur reçoit un mot différent (l'intrus) mais ne le sait pas
-   **Objectif** : Identifier l'intrus en écoutant les descriptions
-   **Victoire** : Premier joueur à atteindre 10 points

### Règle clé 🔑

**Aucun joueur ne connaît son statut** (intrus ou normal). Chacun reçoit uniquement un mot et doit déduire s'il a le mot de la majorité.

## 🚀 Démarrage rapide

### Prérequis

-   Node.js >= 16.0.0
-   pnpm (recommandé) ou npm

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/TheImpostor.git
cd TheImpostor

# Installer toutes les dépendances
pnpm install
```

### Lancement

**Terminal 1 - Serveur :**

```bash
cd server
pnpm run dev
```

**Terminal 2 - Client :**

```bash
cd client
pnpm run dev
```

Le serveur démarre sur `http://localhost:3001`  
Le client démarre sur `http://localhost:5173`

## 📂 Structure du projet

```
TheImpostor/
├── client/                 # Application React
│   ├── src/
│   │   ├── pages/         # Pages principales (Home, Lobby, Game)
│   │   ├── contexts/      # Context Socket.IO
│   │   ├── utils/         # Constantes et helpers
│   │   └── index.css      # Styles Tailwind
│   └── package.json
├── server/                 # Serveur Node.js
│   ├── src/
│   │   ├── game/          # Logique métier (GameManager, Room, Player)
│   │   ├── socket/        # Gestionnaires Socket.IO
│   │   ├── data/          # Paires de mots
│   │   └── utils/         # Logger
│   └── package.json
├── docs/                   # Documentation
└── package.json           # Scripts racine
```

## 🎯 Fonctionnalités

### ✅ Actuellement implémentées (Sprint 1)

-   Création et gestion de salons
-   Connexion temps réel (Socket.IO)
-   Distribution aléatoire des mots
-   Désignation du premier orateur
-   Interface responsive (Tailwind CSS)

### 🚧 En développement

-   **Sprint 2** : Système de vote avec timer
-   **Sprint 3** : Calcul automatique des scores
-   **Sprint 4** : Interface administrateur

## 🛠️ Stack technique

**Frontend :**

-   React 18.2 (hooks natifs)
-   React Router 6
-   Socket.IO Client 4.8
-   Tailwind CSS 3.4
-   Vite 5 (bundler avec SWC)

**Backend :**

-   Node.js
-   Express 4.22
-   Socket.IO 4.8
-   Architecture événementielle

**Outils :**

-   pnpm (gestionnaire de paquets)
-   ESM (modules ES6)

## 📡 Événements Socket.IO

### Client → Serveur

-   `create-room` : Créer un nouveau salon
-   `join-room` : Rejoindre un salon existant
-   `start-game` : Démarrer la partie (hôte uniquement)

### Serveur → Client

-   `room-updated` : Mise à jour de l'état du salon
-   `game-started` : Début de partie
-   `word-assigned` : Attribution du mot personnel
-   `player-disconnected` : Déconnexion d'un joueur

## 🔐 Règles de confidentialité

Le serveur ne transmet **JAMAIS** au client l'information `isImpostor` d'un joueur. Cette donnée reste strictement côté serveur pour :

-   Le calcul des scores (Sprint 2)
-   Les statistiques de fin de partie (Sprint 3)

## 🧪 Tests

```bash
# Serveur
cd server
pnpm test

# Client
cd client
pnpm test
```

## 📖 Documentation complète

La documentation détaillée est disponible dans le dossier `docs/` :

-   [Cahier des charges](docs/01-analyse/cahier-des-charges.md)
-   [Architecture technique](docs/03-developpement/architecture.md)
-   [Guide de contribution](docs/03-developpement/guide-contribution.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Changelog

### v1.0.0 - Sprint 1 (2024-12-29)

-   ✅ Infrastructure client/serveur
-   ✅ Gestion des salons et joueurs
-   ✅ Distribution des mots
-   ✅ Interface de lobby
-   ✅ Page de jeu avec affichage du mot

## 👤 Auteur

**CPC Numérique**

## 📄 License

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :

-   Ouvrir une issue sur GitHub
-   Consulter la documentation dans `/docs`

---

**Note technique :** Ce projet utilise un monorepo pnpm. Les dépendances sont gérées via `pnpm-workspace.yaml`.
