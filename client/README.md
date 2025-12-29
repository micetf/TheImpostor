# Client React - The Impostor

## ✅ Étape 2 terminée

### 📦 Installation

```bash
cd client
pnpm install
```

### 🚀 Démarrage

```bash
pnpm run dev
```

Le client démarre sur **http://localhost:5173**

### 🎯 Fonctionnalités disponibles

✅ Page d'accueil avec connexion au serveur  
✅ Création de salon  
✅ Rejoindre un salon via code  
✅ Page Lobby avec liste des joueurs en temps réel  
✅ Indicateur de connexion Socket.IO  
✅ Détection automatique de l'hôte  
✅ Design responsive avec Tailwind CSS  

### 🧪 Test du flux complet

1. **Démarrer le serveur** (dans un terminal)
   ```bash
   cd server
   pnpm run dev
   ```

2. **Démarrer le client** (dans un autre terminal)
   ```bash
   cd client
   pnpm run dev
   ```

3. **Ouvrir plusieurs onglets** http://localhost:5173

4. **Scénario de test:**
   - Onglet 1: Créer un salon avec le nom "Alice"
   - Copier le code du salon (ex: "ABC12345")
   - Onglet 2: Rejoindre avec le code et le nom "Bob"
   - Onglet 3: Rejoindre avec le code et le nom "Charlie"
   - Observer la mise à jour en temps réel de la liste des joueurs
   - Vérifier que "Alice" est marquée comme hôte (👑)

### 📂 Structure

```
client/
├── src/
│   ├── components/     (vide pour l'instant)
│   ├── hooks/
│   │   └── useSocket.js       # Hook Socket.IO
│   ├── pages/
│   │   ├── Home.jsx           # Page d'accueil
│   │   └── Lobby.jsx          # Salle d'attente
│   ├── utils/
│   │   └── constants.js       # Configuration
│   ├── App.jsx                # Router
│   ├── main.jsx               # Point d'entrée
│   └── index.css              # Styles Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### 🎨 Classes Tailwind personnalisées

- `.btn-primary` - Bouton principal
- `.btn-secondary` - Bouton secondaire
- `.input-field` - Champ de saisie
- `.card` - Carte avec ombre

### 🔌 Événements Socket.IO utilisés

**Client → Serveur:**
- `create-room` - Créer un salon
- `join-room` - Rejoindre un salon
- `get-room-info` - Récupérer infos salon

**Serveur → Client:**
- `room-updated` - Mise à jour du salon
- `player-disconnected` - Joueur déconnecté

### ⚠️ Points d'attention

- Le serveur doit tourner sur le port **3001**
- La connexion Socket.IO est configurée sur `http://localhost:3001`
- Le client démarre automatiquement sur le port **5173**

### 🚀 Prochaines étapes

- **Étape 3:** Distribution des mots et début de partie
- **Étape 4:** Système de vote
- **Étape 5:** Calcul des scores et fin de partie
