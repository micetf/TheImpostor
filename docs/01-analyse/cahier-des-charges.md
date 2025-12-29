# Cahier des Charges - The Impostor

## 1. Présentation du Projet

### Objectifs

"The Impostor" est un jeu multijoueur en ligne inspiré du jeu "Undercover". Les joueurs reçoivent des mots et doivent identifier celui qui a un mot différent à travers des discussions et votes.

### Public Cible

-   Familles
-   Groupes d'amis
-   Joueurs occasionnels (3-10 joueurs par partie)
-   Administrateurs (gestion multi-salons)

## 2. Règles du Jeu

### Configuration

-   **Nombre de joueurs** : 3 à 10 par partie
-   **Rôles** :
    -   Joueurs normaux : Reçoivent le même mot (mot équipe)
    -   Intrus : Reçoit un mot différent (mot intrus)
    -   Hôte : Premier joueur connecté, peut démarrer la partie

### Règle de confidentialité ⚠️

**AUCUN joueur ne connaît son statut.** Chacun reçoit uniquement un mot et doit déduire s'il a le mot de la majorité en écoutant les descriptions des autres.

### Déroulement d'une Partie

1. **Distribution des mots** (automatique)

    - Un joueur reçoit le "mot intrus"
    - Les autres reçoivent le "mot équipe"
    - Personne ne sait qui est l'intrus

2. **Désignation du premier orateur** (aléatoire)

3. **Phase d'échange à l'oral**

    - Chaque joueur décrit son mot sans le dire
    - Écoute des autres pour détecter l'intrus

4. **Vote**

    - Un joueur initie le vote
    - Timer de 30 secondes
    - Chacun vote pour désigner l'intrus

5. **Attribution des points**

    - +1 point : identification correcte de l'intrus
    - -1 point : erreur d'identification
    - ±2 points : initiateur du vote (correct/incorrect)
    - -1 point : non-vote
    - -2 points : initiateur qui ne vote pas

6. **Condition de victoire**
    - Premier joueur à atteindre 10 points

### Gestion des Déconnexions

-   **Fenêtre de reconnexion** : 2 minutes
-   **Mise en pause** : Si < 3 joueurs actifs
-   **Fermeture** : Si tous les joueurs quittent

## 3. Fonctionnalités Techniques

### Salon de Jeu

-   Création de salon (code unique 8 caractères)
-   Rejoindre via code
-   Maximum 10 joueurs
-   Hôte peut démarrer si ≥ 3 joueurs

### Interface Utilisateur

-   Design responsive (mobile-first)
-   Tailwind CSS pour styling
-   Temps réel via Socket.IO

### Phases de Jeu

-   `waiting` : Attente de joueurs
-   `playing` : Échange à l'oral
-   `voting` : Vote en cours
-   `paused` : Partie en pause
-   `ended` : Partie terminée

## 4. Technologies

### Frontend

-   React 18.2 (hooks natifs)
-   Tailwind CSS 3.4
-   Socket.IO Client 4.8
-   Vite 5 (bundler)

### Backend

-   Node.js + Express 4.22
-   Socket.IO 4.8
-   Architecture événementielle
-   ESM (modules ES6)

### Hébergement

-   VPS OVH
-   Code source sur GitHub

## 5. Sécurité et Données

### Confidentialité des Rôles

Le serveur ne transmet **JAMAIS** au client l'information `isImpostor`. Cette donnée reste côté serveur uniquement pour :

-   Le calcul automatique des scores
-   Les statistiques de partie

### Authentification

-   Interface admin protégée par login/mot de passe
-   Session côté serveur

### Conformité

-   RGPD pour protection des données personnelles

## 6. Planning et Budget

### Échéancier

-   **Sprint 1** (✅) : Infrastructure et distribution des mots
-   **Sprint 2** : Système de vote
-   **Sprint 3** : Calcul des scores et résultats
-   **Sprint 4** : Interface administrateur

### Budget

-   Budget total : < 10 000 €
-   Hébergement VPS : ~100 €/an
-   Développement : Open-source

## 7. Maintenance

### Support

-   Documentation technique complète
-   Issues GitHub pour signalement bugs
-   Mises à jour régulières

### Tests

-   Tests unitaires (backend)
-   Tests manuels (frontend)
-   Beta testing avec utilisateurs réels

## 8. Contraintes

### Techniques

-   Minimum 3 joueurs pour démarrer
-   Maximum 10 joueurs par salon
-   Connexion internet requise
-   Navigateur moderne (support WebSocket)

### Design

-   Interface minimaliste et épurée
-   Navigation intuitive
-   Accessibilité WCAG niveau AA

---

**Version** : 1.0  
**Dernière mise à jour** : 29 décembre 2024
