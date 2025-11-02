# 🐛 BUG FIX - Prénom affichait "Utilisateur"

## Problème
Après la connexion (ex: n.tetillon), le prénom devrait afficher "Nathan" mais affichait "Utilisateur" à la place.

## Cause Trouvée
Dans `interne/api/src/server.js` ligne 768-774, le endpoint `/api/me` pour les site-users ne remappait pas correctement les champs du JWT vers `prenom`/`nom`:

**❌ Avant:**
```javascript
res.json({
  username: req.user.username,
  prenom: req.user.prenom || '',  // ← req.user.prenom n'existe pas
  nom: req.user.nom || '',         // ← req.user.nom n'existe pas
  roles: req.user.roles || []
});
```

**Raison**: Le JWT était créé avec `firstName` et `lastName` (ligne 560):
```javascript
const token = issueToken({
  sub: siteUser.id,
  username: siteUser.username,
  firstName: siteUser.firstName,   // ← Le JWT a "firstName"
  lastName: siteUser.lastName,     // ← Le JWT a "lastName"
  ...
});
```

Mais le endpoint `/api/me` regardait `req.user.prenom` et `req.user.nom` qui **n'existaient pas dans le JWT décodé**!

## Chaîne d'événements

1. ✅ Login réussit → `/auth/login` retourne `{ user: { prenom: "Nathan", ... } }`
2. ✅ UserContext sauvegarde en localStorage avec prénom
3. ❌ **Mais ensuite**, `ensureSession()` appelle `/api/me`
4. ❌ `/api/me` essaie d'accéder à `req.user.prenom` (vide) au lieu de `req.user.firstName`
5. ❌ UserContext met à jour avec `prenom: ''` (vide)
6. ❌ Header affiche "Utilisateur" car `prenom || 'Utilisateur'` = 'Utilisateur'

## Solution Appliquée

**✅ Après:** dans `interne/api/src/server.js` ligne 768-774:
```javascript
res.json({
  username: req.user.username,
  prenom: req.user.prenom || req.user.firstName || '',  // ← Remap firstName → prenom
  nom: req.user.nom || req.user.lastName || '',          // ← Remap lastName → nom
  roles: req.user.roles || []
});
```

## Test

Pour vérifier:
1. Connexion avec `n.tetillon` / `RBE185C`
2. Regarder le header → doit afficher "Bonjour, Nathan"
3. Vérifier DevTools → Network → `/api/me` retourne `prenom: "Nathan"`

## Fichiers Modifiés
- `interne/api/src/server.js` - ligne 768-774

