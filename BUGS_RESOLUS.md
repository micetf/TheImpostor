# Bugs Résolus - Sprint 2

Documentation technique des bugs majeurs identifiés et résolus lors de l'implémentation du Sprint 2.

---

## 🐛 Bug #1 : Connexion WebSocket impossible sur Firefox

**Date de résolution** : 30/12/2024

### Symptômes

```
Firefox ne peut établir de connexion avec le serveur
à l'adresse ws://192.168.1.14:3001/socket.io/?EIO=4&transport=websocket

La connexion avec ws://192.168.1.14:3001/socket.io/?EIO=4&transport=websocket
a été interrompue pendant le chargement de la page
```

-   ✅ Chrome : Fonctionnait
-   ❌ Firefox : Échouait systématiquement
-   ❌ Safari : Non testé mais probablement affecté

### Cause

Configuration Socket.IO trop restrictive côté client :

```javascript
// ❌ Configuration problématique
io(SERVER_URL, {
    transports: ["websocket"], // Force WebSocket uniquement, pas de fallback
});
```

Le client tentait une connexion WebSocket directe sans fallback. Si la connexion WebSocket échouait (délai réseau, strict mode Firefox), aucune alternative n'était tentée.

### Solution

Autoriser le fallback en mode polling :

```javascript
// ✅ Configuration corrigée
io(SERVER_URL, {
    transports: ["websocket", "polling"], // WebSocket avec fallback polling
    upgrade: true, // Permet l'upgrade automatique vers WebSocket
    rememberUpgrade: true, // Mémorise la réussite de l'upgrade
});
```

**Comportement corrigé :**

1. Client se connecte en polling (HTTP standard, toujours fonctionnel)
2. Socket.IO tente automatiquement un upgrade vers WebSocket
3. Si l'upgrade réussit → utilise WebSocket (optimal)
4. Si l'upgrade échoue → reste en polling (fonctionnel mais moins performant)

### Fichiers modifiés

-   `client/src/contexts/SocketContext.jsx`

### Tests de validation

-   [x] Chrome : Connexion WebSocket réussie
-   [x] Firefox : Connexion polling puis upgrade WebSocket
-   [x] Réseau local : Accès depuis 192.168.x.x fonctionnel

---

## 🐛 Bug #2 : Double montage React StrictMode provoque des déconnexions

**Date de résolution** : 30/12/2024

### Symptômes

```
🔗 Tentative de connexion à: http://...
🧹 Nettoyage de la connexion Socket.IO
🔗 Tentative de connexion à: http://...
❌ Déconnecté du serveur
   - Raison: io client disconnect
⚠️  Déconnexion volontaire du client
🔗 Tentative de connexion à: http://...
✅ Connecté au serveur
```

En développement avec React 18 StrictMode :

-   Le composant SocketProvider se montait **deux fois**
-   Première connexion immédiatement détruite
-   Deuxième connexion parfois en échec (race condition)
-   Firefox plus sensible que Chrome au timing

### Cause

React 18 en développement monte/démonte intentionnellement les composants deux fois pour détecter les effets de bord. Le cleanup de `useEffect` déconnectait le socket immédiatement :

```javascript
// ❌ Problématique
useEffect(() => {
    socketRef.current = io(SERVER_URL, { ... });

    return () => {
        socket.disconnect(); // Appelé lors du démontage StrictMode
    };
}, []);
```

**Chronologie de la race condition :**

1. **Montage 1** : Socket se connecte
2. **Démontage StrictMode** : Socket se déconnecte immédiatement
3. **Montage 2** : Nouvelle tentative de connexion
    - ✅ Chrome : timing favorable, réussit
    - ❌ Firefox : timing défavorable, échoue

### Solution

Ajout d'un flag `isInitialized` pour ignorer le remontage et conserver le socket en développement :

```javascript
// ✅ Solution
const isInitialized = useRef(false);

useEffect(() => {
    // Protection contre le double montage
    if (isInitialized.current) {
        console.log("⚠️  Socket déjà initialisé, on ignore ce montage");
        return;
    }

    isInitialized.current = true;
    socketRef.current = io(SERVER_URL, { ... });

    return () => {
        // Déconnexion uniquement en production
        if (process.env.NODE_ENV === 'production') {
            socket.disconnect();
            isInitialized.current = false;
        } else {
            console.log("🔄 Mode développement : Socket conservé");
        }
    };
}, []);
```

### Fichiers modifiés

-   `client/src/contexts/SocketContext.jsx`

### Références

-   [React 18 StrictMode Double Mount](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)
-   [Socket.IO with React StrictMode](https://socket.io/docs/v4/client-initialization/#with-react)

---

## 🐛 Bug #3 : Race condition lors de la distribution des mots

**Date de résolution** : 30/12/2024

### Symptômes

**Joueur qui démarre (hôte) :**

```
✅ Connecté
🎯 Mot reçu: investissement
```

**Autres joueurs :**

```
✅ Connecté
📥 État du jeu reçu: { ... }
⏳ Chargement de votre mot...  ← Bloqué ici indéfiniment
```

-   L'hôte recevait son mot correctement
-   Les autres joueurs restaient bloqués sur "Chargement de votre mot..."
-   Le mot n'était jamais affiché

### Cause

**Chronologie de la race condition :**

```
T0: Hôte clique "Démarrer la partie"
T1: Serveur émet word-assigned → Tous les sockets connectés
T2: Hôte reçoit word-assigned (sa page Game est déjà montée)
T3: Autres joueurs reçoivent game-started dans Lobby.jsx
T4: Autres joueurs naviguent vers /game/{roomId} (React Router)
T5: React Router démonte Lobby et monte Game (~100-300ms)
T6: Page Game des autres joueurs commence à écouter word-assigned
    ❌ TROP TARD ! L'événement a déjà été émis à T1
```

Les événements Socket.IO sont éphémères : si un client n'écoute pas au moment de l'émission, il rate l'événement définitivement.

### Solution 1 : Ajout de l'événement `get-game-state`

Créer un événement pour récupérer l'état complet à la demande :

**Serveur (`socketHandler.js`) :**

```javascript
socket.on("get-game-state", (roomId, callback) => {
    const room = gameManager.getRoom(roomId);
    const player = room.findPlayer(socket.id);

    callback({
        success: true,
        phase: room.gameState.phase,
        currentRound: room.gameState.currentRound,
        firstSpeaker: room.gameState.firstSpeaker,
        voteEndTime: room.gameState.voteEndTime,
        word: player.currentWord, // ⬅️ Le mot personnel du joueur
        players: room.players.map(p => ({ ... }))
    });
});
```

**Client (`Game.jsx`) :**

```javascript
useEffect(() => {
    // Récupérer l'état au montage
    socket.emit("get-game-state", roomId, (response) => {
        if (response.success) {
            setGameState({ ... });
            setMyWord(response.word); // ⬅️ Mot reçu à coup sûr
        }
    });

    // Continuer à écouter word-assigned pour les nouveaux tours
    socket.on("word-assigned", handleWordAssigned);
}, [socket, isConnected, roomId]);
```

### Solution 2 : Fallback si mot non reçu

Ajout d'un timeout de secours dans `handleNewRound` :

```javascript
const handleNewRound = (data) => {
    setMyWord(null); // Réinitialiser

    // Si le mot n'arrive pas dans 500ms, forcer la récupération
    setTimeout(() => {
        if (!myWord) {
            console.log("⚠️  Mot non reçu, récupération forcée");
            socket.emit("get-game-state", roomId, (response) => {
                if (response.word) setMyWord(response.word);
            });
        }
    }, 500);
};
```

### Fichiers modifiés

-   `server/src/socket/socketHandler.js` : Ajout gestionnaire `get-game-state`
-   `client/src/pages/Game.jsx` : Appel `get-game-state` au montage

### Leçon apprise

**Principe de design pour Socket.IO :**

> Pour tout état critique qui doit être garanti, implémenter un mécanisme de récupération à la demande en plus des événements push.

Les événements push (`emit`) sont optimaux pour la réactivité, mais un système de pull (`emit` + `callback`) garantit la fiabilité.

---

## 🐛 Bug #4 : État du jeu non synchronisé (Tour 0 affiché)

**Date de résolution** : 30/12/2024

### Symptômes

Interface affichait :

```
🎮 Partie en cours
Tour 0 -           ← ❌ Devrait être "Tour 1"
Code salon: ABC123
```

Console logs :

```
🎮 Partie démarrée: { currentRound: 1, ... }
🎮 Page Game montée
🎯 Mot reçu: ...
```

Le serveur indiquait bien `currentRound: 1`, mais l'interface affichait 0.

### Cause

État initial de `gameState` dans `Game.jsx` :

```javascript
const [gameState, setGameState] = useState({
    phase: "loading",
    currentRound: 0, // ⬅️ Initialisé à 0
    // ...
});
```

L'événement `game-started` était raté (même race condition que Bug #3), donc `currentRound` restait à 0.

### Solution

Utiliser `get-game-state` pour récupérer l'état complet au montage :

```javascript
useEffect(() => {
    socket.emit("get-game-state", roomId, (response) => {
        if (response.success) {
            setGameState((prev) => ({
                ...prev,
                phase: response.phase,
                currentRound: response.currentRound, // ⬅️ Mis à jour
                firstSpeaker: response.firstSpeaker,
                // ...
            }));
        }
    });
}, [socket, isConnected, roomId]);
```

### Fichiers modifiés

-   `client/src/pages/Game.jsx` : Utilisation de `get-game-state`

### Note

Ce bug était un symptôme du Bug #3. La solution pour le Bug #3 a automatiquement résolu celui-ci.

---

## 📊 Résumé des impacts

| Bug                       | Gravité      | Impact utilisateur                   | Temps résolution |
| ------------------------- | ------------ | ------------------------------------ | ---------------- |
| #1 - WebSocket Firefox    | 🔴 Critique  | Impossible de jouer sur Firefox      | 2h               |
| #2 - Double montage       | 🟠 Important | Déconnexions aléatoires, instabilité | 1h               |
| #3 - Race condition mots  | 🔴 Critique  | Joueurs bloqués, partie impossible   | 1h30             |
| #4 - État non synchronisé | 🟡 Moyen     | Affichage incorrect du tour          | 30min            |

**Total :** 4 bugs critiques ou importants résolus en ~5h de debug et développement.

---

## 🎯 Bonnes pratiques établies

Suite à ces résolutions :

1. **Toujours prévoir un fallback** pour les connexions temps réel
2. **Protéger contre React StrictMode** avec des refs et flags
3. **Implémenter pull + push** pour les états critiques (pas seulement push)
4. **Tester sur plusieurs navigateurs** dès le début (Chrome, Firefox minimum)
5. **Logger exhaustivement** pour faciliter le debug des problèmes réseau
6. **Documenter les race conditions** rencontrées pour éviter de les recréer

---

**Dernière mise à jour** : 30 décembre 2024
