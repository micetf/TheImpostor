# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir (Sprint 2)

-   Système de vote avec timer de 30 secondes
-   Collection et affichage des votes en temps réel
-   Calcul automatique des résultats de vote

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

### Corrections

-   Résolution problème CORS lors du démarrage de partie
-   Correction redirection automatique de tous les joueurs (pas seulement l'hôte)
-   Fix reconnexion lors de navigation entre pages

### Technique

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

**Prochaine version** : 1.1.0 (Sprint 2 - Système de vote)
