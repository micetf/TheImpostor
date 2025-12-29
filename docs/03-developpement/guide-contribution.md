# Guide de Contribution - The Impostor

## Bienvenue !

Merci de votre intérêt pour contribuer à The Impostor. Ce guide vous aidera à démarrer.

## Prérequis

-   Node.js >= 16.0.0
-   pnpm (gestionnaire de paquets recommandé)
-   Git
-   Éditeur de code (VS Code recommandé)

## Configuration de l'environnement

### 1. Fork et Clone

```bash
# Fork le projet sur GitHub puis cloner votre fork
git clone https://github.com/VOTRE-USERNAME/TheImpostor.git
cd TheImpostor

# Ajouter l'upstream
git remote add upstream https://github.com/ORIGINAL-USERNAME/TheImpostor.git
```

### 2. Installation

```bash
# Installer toutes les dépendances (client + serveur)
pnpm install

# Ou installation séparée
cd server && pnpm install
cd ../client && pnpm install
```

### 3. Lancement en développement

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

## Standards de Code

### JavaScript/JSX

-   **ESM** : Utiliser `import/export` (pas de `require`)
-   **Hooks React** : Uniquement des composants fonctionnels
-   **Nommage** : camelCase pour variables, PascalCase pour composants
-   **Documentation** : JSDoc en français pour toutes les fonctions

**Exemple :**

```javascript
/**
 * Trouve un joueur par son ID de socket
 * @param {string} socketId - ID du socket
 * @returns {Player|null}
 */
findPlayer(socketId) {
    return this.players.find(p => p.id === socketId) || null;
}
```

### Tailwind CSS

-   **Ordre des classes** : Layout → Spacing → Sizing → Colors → Typography → Effects
-   **Responsive** : Mobile-first (défaut → `sm:` → `md:` → `lg:`)
-   **Classes utilitaires** : Privilégier les classes Tailwind aux styles inline

**Exemple :**

```jsx
<button className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
```

### Commits

Suivre la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description courte

[body optionnel]

[footer optionnel]
```

**Types :**

-   `feat` : Nouvelle fonctionnalité
-   `fix` : Correction de bug
-   `docs` : Documentation
-   `style` : Formatage (sans changement de code)
-   `refactor` : Refactoring
-   `test` : Ajout/modification de tests
-   `chore` : Tâches de maintenance

**Exemples :**

```bash
git commit -m "feat(server): ajout système de vote avec timer"
git commit -m "fix(client): correction redirection après déconnexion"
git commit -m "docs: mise à jour README avec instructions déploiement"
```

## Workflow Git

### 1. Créer une branche

```bash
# Toujours partir de main à jour
git checkout main
git pull upstream main

# Créer une branche feature
git checkout -b feat/nom-de-la-fonctionnalite
```

### 2. Développer

```bash
# Faire vos modifications
# Commiter régulièrement avec des messages clairs
git add .
git commit -m "feat(scope): description"
```

### 3. Synchroniser avec upstream

```bash
# Avant de push, récupérer les derniers changements
git fetch upstream
git rebase upstream/main

# Résoudre les conflits si nécessaire
# Puis push
git push origin feat/nom-de-la-fonctionnalite
```

### 4. Pull Request

1. Aller sur GitHub
2. Créer une Pull Request depuis votre branche
3. Remplir le template (description, tests, captures d'écran)
4. Attendre la review

## Structure des Branches

-   `main` : Branche stable de production
-   `develop` : Branche de développement (si utilisée)
-   `feat/*` : Nouvelles fonctionnalités
-   `fix/*` : Corrections de bugs
-   `docs/*` : Documentation uniquement
-   `refactor/*` : Refactoring

## Règles de Confidentialité

### ⚠️ CRITIQUE : Attribut isImpostor

L'attribut `isImpostor` d'un joueur ne doit **JAMAIS** être transmis au client.

**✅ Correct :**

```javascript
// Utiliser toGameJSON() pour les données client
io.to(roomId).emit("game-state", room.toGameJSON());

// Utiliser toServerJSON() pour calculs serveur
const serverData = room.toServerJSON();
const impostor = serverData.players.find((p) => p.isImpostor);
```

**❌ Incorrect :**

```javascript
// JAMAIS faire ça
io.to(roomId).emit("players", room.players);
socket.emit("data", { isImpostor: player.isImpostor });
```

## Tests

### Tests Manuels

Avant de soumettre une PR, tester manuellement :

1. **Créer un salon** avec 3 joueurs (3 onglets)
2. **Démarrer une partie** depuis l'hôte
3. **Vérifier** que tous les joueurs voient leur mot
4. **Vérifier** que personne ne voit d'indication "intrus"
5. **Tester la déconnexion** d'un joueur et reconnexion

### Tests Unitaires (à venir)

```bash
# Serveur
cd server
pnpm test

# Client
cd client
pnpm test
```

## Checklist Pull Request

Avant de soumettre une PR, vérifier :

-   [ ] Code respecte les standards (ESM, JSDoc, Tailwind)
-   [ ] Commits suivent Conventional Commits
-   [ ] Tests manuels passent
-   [ ] Aucune donnée sensible (isImpostor) exposée au client
-   [ ] Documentation mise à jour si nécessaire
-   [ ] Pas de `console.log` oubliés (sauf logs serveur)
-   [ ] Code formaté proprement

## Ressources Utiles

### Documentation

-   [Socket.IO Docs](https://socket.io/docs/v4/)
-   [React Docs](https://react.dev/)
-   [Tailwind CSS](https://tailwindcss.com/docs)
-   [Vite Guide](https://vitejs.dev/guide/)

### Outils

-   [ESLint](https://eslint.org/) - Linter JavaScript
-   [Prettier](https://prettier.io/) - Formateur de code

## Sprints et Roadmap

### Sprint 1 ✅ (Terminé)

-   Infrastructure client/serveur
-   Distribution des mots
-   Interface lobby et game

### Sprint 2 🚧 (En cours)

-   Système de vote avec timer
-   Collection des votes
-   Calcul des résultats

### Sprint 3 📋 (Planifié)

-   Attribution automatique des points
-   Affichage des scores
-   Détection du gagnant

### Sprint 4 📋 (Planifié)

-   Interface administrateur
-   Gestion multi-salons
-   Statistiques avancées

## Questions et Support

-   **Issues GitHub** : Problèmes techniques ou bugs
-   **Discussions GitHub** : Questions générales
-   **Documentation** : Consulter le dossier `/docs`

## Code de Conduite

-   Respecter tous les contributeurs
-   Feedback constructif et bienveillant
-   Pas de contenu offensant ou discriminatoire
-   Privilégier la clarté et la pédagogie

---

**Merci de contribuer à The Impostor ! 🎉**
