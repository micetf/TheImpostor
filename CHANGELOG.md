# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir (Sprint 3)

-   Affichage du classement en temps réel pendant la partie
-   Historique des tours précédents accessible
-   Statistiques par joueur (taux de réussite, rôle d'intrus joué, etc.)
-   Animation de transition entre les tours
-   Récapitulatif de fin de partie complet

## [1.1.1] - 2024-12-30

### Corrigé

-   **Timer de vote bloqué à 30 secondes** (critique)
    -   Incohérence de nommage entre serveur et client (`endTime` vs `endsAt` vs `voteEndTime`)
    -   Le timestamp de fin du vote n'était pas transmis correctement au client
    -   Uniformisation avec `voteEndTime` dans tous les fichiers
    -   Ajout de logs de debug pour faciliter le suivi du timer
    -   Le timer se décrémente maintenant correctement de 30 à 0 secondes
    -   Ajout de validation du `voteEndTime` dans `VotePanel.jsx`

#### Fichiers modifiés

-   `server/src/game/Room.js` : Méthode `initiateVote()` retourne `voteEndTime` au lieu de `endTime`
-   `server/src/socket/socketHandler.js` : Événement `vote-started` émet `voteEndTime` au lieu de `endsAt`
-   `client/src/pages/Game.jsx` : Handler `handleVoteStarted` utilise `data.voteEndTime`
-   `client/src/components/VotePanel.jsx` : Ajout validation et logs de debug

## [1.1.0] - 2024-12-30

### Sprint 2 - Système de Vote (COMPLÉTÉ)

#### Ajouté

-   **Système de vote complet**

    -   Initiation du vote par n'importe quel joueur
    -   Timer de 30 secondes avec barre de progression visuelle
    -   Interface de vote avec sélection des joueurs (composant `VotePanel.jsx`)
    -   Compteur de votes en temps réel
    -   Fin anticipée quand tous les joueurs ont voté
    -   Fin automatique à l'expiration du timer

-   **Calcul automatique des scores**

    -   Attribution des points selon les règles du jeu :
        -   Vote correct : +1 point
        -   Vote incorrect : -1 point
        -   Initiateur vote correct : +2 points
        -   Initiateur vote incorrect : -2 points
        -   Non-vote : -1 point
        -   Initiateur non-vote : -2 points
    -   Détection automatique du gagnant (≥ 10 points)
    -   Mise à jour du score en temps réel

-   **Écran de résultats détaillé** (composant `Results.jsx`)

    -   Révélation du véritable intrus
    -   Affichage des deux mots (équipe vs intrus)
    -   Détail des votes reçus par chaque joueur
    -   Attribution des points avec justifications
    -   Classement actualisé après chaque tour
    -   Écran de victoire si un joueur atteint 10 points

-   **Gestion des tours multiples**

    -   Bouton "Tour suivant" pour l'hôte
    -   Réinitialisation automatique des joueurs entre les tours
    -   Nouvelle distribution des mots aléatoire
    -   Nouveau premier orateur désigné aléatoirement
    -   Événement `new-round-started` avec synchronisation complète

-   **Nouvel événement Socket.IO : `get-game-state`**

    -   Permet aux joueurs de récupérer l'état complet du jeu au montage
    -   Résout les problèmes de race condition
    -   Renvoie le mot personnel du joueur demandeur
    -   Synchronise le numéro de tour, la phase, et la liste des joueurs
    -   Utilisé automatiquement lors de l'arrivée sur la page Game

-   **Composants React**
    -   `VotePanel.jsx` : Interface de vote avec timer visuel
    -   `Results.jsx` : Écran de résultats complet et détaillé

#### Corrigé

-   **Problème de connexion WebSocket (critique)**

    -   Ajout du fallback polling pour Firefox
    -   Configuration `transports: ["websocket", "polling"]`
    -   Amélioration de la gestion des reconnexions automatiques
    -   Compatibilité cross-browser validée (Chrome, Firefox, Safari, Edge)
    -   Résolution de l'erreur "Firefox ne peut établir de connexion WebSocket"

-   **Double montage React StrictMode**

    -   Ajout d'un flag `isInitialized.current` pour éviter les doubles connexions
    -   Conservation du socket en développement lors du remontage StrictMode
    -   Déconnexion propre uniquement en production
    -   Logs de debug améliorés pour distinguer montage/démontage/remontage

-   **Race condition distribution des mots (critique)**

    -   L'événement `word-assigned` était émis avant que tous les clients soient prêts à l'écouter
    -   Les joueurs qui rejoignaient après le démarrage restaient bloqués sur "Chargement du mot..."
    -   Solution : récupération du mot via `get-game-state` au montage de Game.jsx
    -   Garantit que chaque joueur reçoit son mot même en arrivant avec un délai réseau

-   **Synchronisation de l'état du jeu**

    -   Le numéro de tour affichait "Tour 0" au lieu de "Tour 1"
    -   La phase du jeu n'était pas synchronisée entre les clients
    -   Ajout de la récupération de l'état complet au montage de la page Game
    -   Tous les clients affichent maintenant le bon tour, la bonne phase, et les bons joueurs

-   **Gestion des événements Socket.IO**
    -   Nettoyage propre des listeners dans les useEffect
    -   Ajout de `roomId` dans les dépendances pour éviter les stale closures
    -   Protection contre les appels multiples à `endVote()` avec flag `voteEnded`

#### Technique

-   Amélioration des logs serveur avec timestamps ISO
-   Amélioration des logs client avec emojis pour faciliter le debug
-   Ajout de logs détaillés pour tracer les connexions WebSocket
-   Configuration CORS élargie pour le développement réseau local
-   Protection contre les appels multiples aux fonctions critiques
-   Gestion propre du nettoyage des timers côté serveur
-   Documentation JSDoc complète en français pour tous les nouveaux composants

#### Documentation

-   Mise à jour du README avec l'état d'avancement du Sprint 2
-   Documentation des bugs résolus avec solutions techniques
-   Ajout de guides de debug pour les problèmes de connexion
-   Documentation des événements Socket.IO ajoutés

## [1.0.0] - 2024-12-29

### Sprint 1 - Infrastructure et Distribution des Mots

#### Ajouté

-   **Infrastructure complète client/serveur**

    -   Serveur Node.js + Express + Socket.IO
    -   Client React + Vite + Tailwind CSS
    -   Architecture monorepo avec pnpm

-   **Gestion des salons**

    -   Création de salon avec code unique (8 caractères)
    -   Rejoindre un salon via code
    -   Liste des joueurs en temps réel
    -   Système d'hôte (premier joueur connecté)

-   **Distribution des mots**

    -   355 paires de mots dans 15 catégories
    -   Sélection aléatoire d'une paire par partie
    -   Désignation aléatoire de l'intrus (1 joueur)
    -   Distribution automatique aux joueurs

-   **Interfaces utilisateur**

    -   Page d'accueil (Home.jsx) : Créer/Rejoindre salon
    -   Page Lobby (Lobby.jsx) : Salle d'attente avec liste joueurs
    -   Page Game (Game.jsx) : Affichage du mot personnel
    -   Design responsive avec Tailwind CSS

-   **Système de communication temps réel**

    -   Context Socket.IO global (une seule connexion)
    -   Événements : create-room, join-room, start-game
    -   Mise à jour automatique de l'état du salon
    -   Redirection automatique de tous les joueurs au démarrage

-   **Règle de confidentialité**

    -   Attribut `isImpostor` JAMAIS transmis au client
    -   Méthodes `toGameJSON()` et `toServerJSON()` pour contrôle des données
    -   Aucun joueur ne connaît son statut (normal ou intrus)

-   **Documentation**
    -   README.md complet avec instructions
    -   Cahier des charges mis à jour
    -   Architecture technique détaillée
    -   Guide de contribution

#### Sécurité

-   Configuration CORS stricte (localhost:5173)
-   Séparation données client/serveur
-   Protection de l'information `isImpostor`

#### Configuration

-   Scripts pnpm pour dev et production
-   Vite avec SWC pour compilation rapide
-   Tailwind JIT mode activé
-   ESM (modules ES6) sur serveur et client

#### Corrections

-   Résolution problème CORS lors du démarrage de partie
-   Correction redirection automatique de tous les joueurs (pas seulement l'hôte)
-   Fix reconnexion lors de navigation entre pages

#### Technique

-   Port serveur : 3001
-   Port client : 5173
-   Minimum 3 joueurs pour démarrer
-   Maximum 10 joueurs par salon
-   Fenêtre de reconnexion : 2 minutes

---

## Format des Versions

Le numéro de version suit le format `MAJOR.MINOR.PATCH` :

-   **MAJOR** : Changements incompatibles avec les versions précédentes
-   **MINOR** : Ajout de fonctionnalités rétro-compatibles
-   **PATCH** : Corrections de bugs rétro-compatibles

## Types de Changements

-   **Ajouté** : Nouvelles fonctionnalités
-   **Modifié** : Changements dans les fonctionnalités existantes
-   **Déprécié** : Fonctionnalités bientôt supprimées
-   **Supprimé** : Fonctionnalités retirées
-   **Corrigé** : Corrections de bugs
-   **Sécurité** : Corrections de vulnérabilités

---

**Prochaine version** : 1.2.0 (Sprint 3 - Améliorations UX et statistiques)
