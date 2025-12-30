# The Impostor - Jeu Multijoueur

![Version](https://img.shields.io/badge/version-1.1.0-blue)
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

### Accès réseau local

Pour jouer depuis plusieurs appareils sur le même réseau :

1. **Trouve ton IP locale** :

    ```bash
    # Windows
    ipconfig

    # macOS/Linux
    ifconfig
    ```

2. **Crée un fichier `.env.local` dans `client/`** :

    ```env
    VITE_SERVER_URL=http://192.168.1.XX:3001
    ```

    (Remplace `192.168.1.XX` par ton IP)

3. **Redémarre le client** :

    ```bash
    cd client
    pnpm run dev
    ```

4. **Accède depuis n'importe quel appareil** du réseau :
    ```
    http://192.168.1.XX:5173
    ```

## 📂 Structure du projet

```
TheImpostor/
├── client/                 # Application React
│   ├── src/
│   │   ├── pages/         # Pages principales (Home, Lobby, Game)
│   │   ├── components/    # Composants réutilisables (VotePanel, Results)
│   │   ├── contexts/      # Context Socket.IO
│   │   ├── utils/         # Constantes et helpers
│   │   └── index.css      # Styles Tailwind
│   └── package.json
├── server/                 # Serveur Node.js
│   ├── src/
│   │   ├── game/          # Logique métier (GameManager, Room, Player)
│   │   ├── socket/        # Gestionnaires Socket.IO
│   │   ├── data/          # Paires de mots (355 paires)
│   │   └── utils/         # Logger
│   └── package.json
├── docs/                   # Documentation
│   ├── 01-analyse/
│   ├── 02-conception/
│   └── 03-developpement/
├── CHANGELOG.md            # Historique des versions
├── BUGS_RESOLUS.md         # Documentation des bugs résolus
└── package.json            # Scripts racine
```

## 🎯 Fonctionnalités

### ✅ Sprint 1 - Infrastructure (v1.0.0)

-   [x] Création et gestion de salons
-   [x] Connexion temps réel (Socket.IO)
-   [x] Distribution aléatoire des mots (355 paires)
-   [x] Désignation du premier orateur
-   [x] Interface responsive (Tailwind CSS)

### ✅ Sprint 2 - Système de Vote (v1.1.0)

-   [x] Initiation du vote par n'importe quel joueur
-   [x] Timer de 30 secondes avec barre de progression
-   [x] Interface de vote avec sélection des joueurs
-   [x] Compteur de votes en temps réel
-   [x] Fin anticipée quand tous ont voté
-   [x] Calcul automatique des scores
-   [x] Écran de résultats détaillé
-   [x] Gestion des tours multiples
-   [x] Détection automatique du gagnant (≥ 10 points)

**Bugs critiques résolus :**

-   [x] Connexion WebSocket Firefox
-   [x] Double montage React StrictMode
-   [x] Race condition distribution des mots
-   [x] Synchronisation de l'état du jeu

### 🚧 Sprint 3 - En développement

-   [ ] Affichage du classement en temps réel
-   [ ] Historique des tours précédents
-   [ ] Statistiques par joueur
-   [ ] Animations de transition

### 📋 Sprint 4 - Planifié

-   [ ] Interface administrateur
-   [ ] Gestion multi-salons
-   [ ] Statistiques globales
-   [ ] Logs des événements

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
-   `get-game-state` : Récupérer l'état complet du jeu
-   `initiate-vote` : Lancer la phase de vote
-   `cast-vote` : Enregistrer un vote
-   `start-next-round` : Démarrer le tour suivant (hôte)

### Serveur → Client

-   `room-updated` : Mise à jour de l'état du salon
-   `game-started` : Début de partie
-   `word-assigned` : Attribution du mot personnel
-   `vote-started` : Début de la phase de vote
-   `vote-registered` : Vote enregistré avec progression
-   `vote-ended` : Résultats du vote et attribution des points
-   `new-round-started` : Début d'un nouveau tour
-   `player-disconnected` : Déconnexion d'un joueur

## 🔐 Règles de confidentialité

Le serveur ne transmet **JAMAIS** au client l'information `isImpostor` d'un joueur. Cette donnée reste strictement côté serveur pour :

-   Le calcul des scores
-   Les statistiques de fin de partie
-   Les résultats de vote

## 🧪 Tests

Pour tester le jeu complet :

1. **Ouvre 3 onglets** dans ton navigateur (minimum 3 joueurs)
2. **Onglet 1 (Alice)** : Crée un salon
3. **Onglets 2 et 3 (Bob, Charlie)** : Rejoignent avec le code
4. **Alice** : Démarre la partie
5. **Tous** : Voient leur mot personnel
6. **Discussion** : Décrivez vos mots à l'oral
7. **Vote** : N'importe qui peut initier le vote
8. **Résultats** : Vérification et attribution des points
9. **Tour suivant** : L'hôte peut lancer le tour suivant

## 🐛 Debug

### Problèmes de connexion

Si tu vois des erreurs WebSocket dans la console :

1. **Vérifie que le serveur tourne** :

    ```bash
    cd server
    pnpm run dev
    ```

2. **Vérifie la configuration réseau** dans `client/.env.local`

3. **Consulte** `BUGS_RESOLUS.md` pour les solutions détaillées

### Logs utiles

**Console navigateur (F12) :**

```
✅ Connecté au serveur
   - Socket ID: abc123
   - Transport: websocket
```

**Console serveur :**

```
🚀 Serveur démarré sur le port 3001
🔌 Connexion établie: abc123
   - Transport: websocket
```

## 📖 Documentation complète

La documentation détaillée est disponible dans le dossier `docs/` :

-   [Cahier des charges](docs/01-analyse/cahier-des-charges.md)
-   [Architecture technique](docs/03-developpement/architecture.md)
-   [Guide de contribution](docs/03-developpement/guide-contribution.md)
-   [Bugs résolus](BUGS_RESOLUS.md)
-   [Changelog](CHANGELOG.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

Voir [Guide de contribution](docs/03-developpement/guide-contribution.md) pour les standards de code.

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet des versions.

### Dernières versions

-   **v1.1.0** (30/12/2024) : Sprint 2 - Système de vote complet
-   **v1.0.0** (29/12/2024) : Sprint 1 - Infrastructure et distribution des mots

## 👤 Auteur

**CPC Numérique**

## 📄 License

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :

-   Ouvrir une issue sur GitHub
-   Consulter `BUGS_RESOLUS.md` pour les problèmes connus
-   Consulter la documentation dans `/docs`

---

**Note technique :** Ce projet utilise un monorepo pnpm. Les dépendances sont gérées via `pnpm-workspace.yaml`.
