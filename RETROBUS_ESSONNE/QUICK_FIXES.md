# 🚀 QUICK FIXES - Action Immédiate

## ⚡ Changements rapides à faire (1-2h)

### 1️⃣ SUPPRIMER `src/apiClient.js` (5 min)

**Vérifier d'abord qui l'utilise:**
```bash
grep -r "from.*apiClient" interne/src --include="*.jsx" --include="*.js"
grep -r "import.*apiClient" interne/src --include="*.jsx" --include="*.js"
```

Si personne l'utilise (probable):
```bash
rm interne/src/apiClient.js
```

**Raison**: Fichier legacy, tout est dans `src/api/config.js`

---

### 2️⃣ FIX PRISMA - REMPLACER `db push` (10 min)

**Fichier**: `interne/api/package.json`

**Avant**:
```json
"scripts": {
  "prisma:push": "prisma db push",
  "start:fresh": "npm run prisma:generate && npm run prisma:push && npm run seed && node ./src/server.js"
}
```

**Après**:
```json
"scripts": {
  "prisma:generate": "prisma generate",
  "prisma:migrate:dev": "prisma migrate dev --name",
  "prisma:migrate:deploy": "prisma migrate deploy",
  "prisma:push": "prisma migrate deploy",
  "seed": "node prisma/seed.js",
  "start": "node ./src/server.js",
  "start:fresh": "npm run prisma:generate && npm run prisma:migrate:deploy && npm run seed && npm start"
}
```

**Actions en Railway/Prod**:
```bash
# Au lieu de: prisma db push
# Faire:
npx prisma migrate deploy
```

---

### 3️⃣ NETTOYER localStorage USAGE (20 min)

**Problème**: SiteManagement.jsx stocke 7+ clés API configs

**Fichier**: `interne/src/pages/SiteManagement.jsx` (lignes 91-110)

**Avant**:
```javascript
const getApiPrefix = () => clean(localStorage.getItem('rbe_api_prefix') || ...);
const getUsersPath = () => clean(localStorage.getItem('rbe_api_site_users_path') || ...);
// ... 5+ autres localStorage calls
```

**Après** - Utiliser SEULEMENT .env:
```javascript
const getApiPrefix = () => clean(import.meta.env?.VITE_API_PREFIX || '');
const getUsersPath = () => clean(import.meta.env?.VITE_API_SITE_USERS_PATH || '');
// ... utiliser directement .env, pas localStorage
```

**Ensuite, supprimer les setItem de localStorage:**
```javascript
// Ligne ~1277: Supprimer cette logique
const setOrRemove = (k, v) => (v && v.trim()) 
  ? localStorage.setItem(k, v.trim())  // ❌ DELETE
  : localStorage.removeItem(k);        // ❌ DELETE
```

**Raison**: Configuration en localStorage persiste entre déploiements = bugs

---

### 4️⃣ AUDIT: QUI UTILISE `src/apiClient.js` (15 min)

**Commande**:
```bash
cd interne
grep -r "apiClient" src --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules" \
  | grep -v "src/api/config.js" \
  | grep -v "src/apiClient.js"
```

**Vérifier aussi les imports**:
```bash
grep -r "from.*apiClient\|import.*apiClient" src --include="*.jsx" --include="*.js"
```

**Résultat attendu**: Seulement des imports de `src/api/config.js`

---

### 5️⃣ VÉRIFIER ROUTES BACKEND (10 min)

**Fichier**: `interne/api/src/server.js`

**Commande - Trouver tous les app.use**:
```bash
grep -n "app\.use\|app\.get\|app\.post" interne/api/src/server.js | head -30
```

**Résultat**: Voir les doublons `/finance` + `/api/finance`

**À faire**: DOCUMENTER dans commentaire de server.js quel format est officiel

```javascript
// ✅ ROUTES API OFFICIELLES: TOUS les endpoints doivent être /api/*
// Les alias ci-dessous sont DEPRECATED et à supprimer:
app.use('/finance', finance);       // ⚠️ À SUPPRIMER
app.use('/site-users', siteUsersRouter); // ⚠️ À SUPPRIMER

// ✅ VERSION OFFICIELLE:
app.use('/api/finance', finance);
app.use('/api/site-users', siteUsersRouter);
```

---

### 6️⃣ AJOUTER CONFIG.MD (15 min)

**Créer**: `interne/docs/CONFIG.md`

```markdown
# Configuration - Interne

## Variables d'environnement

### Development (.env.local)
```env
VITE_API_URL=http://localhost:3001
VITE_API_PREFIX=/api
```

### Production (Vercel env vars)
```
VITE_API_URL=https://api-retrobus-essonne.up.railway.app
VITE_API_PREFIX=/api
```

## ⚠️ Ne PAS utiliser localStorage pour config API

La configuration doit être en:
1. Variables d'environnement (.env / Vercel)
2. Fichier de config serveur

**localStorage** réservé pour:
- `token` - JWT auth token
- `user` - User profile cache
- UI state (dismissed notifications, preferences)
```

---

## 📋 CHECKLIST POST-FIX

Après faire les changements ci-dessus:

- [ ] Supprimer `src/apiClient.js`
- [ ] Vérifier `npm run dev` fonctionne
- [ ] Vérifier `npm run build` fonctionne
- [ ] Tester login → API calls
- [ ] Vérifier aucune erreur localStorage
- [ ] Tester en mode incognito (localStorage vide)

---

## 🧪 COMMANDES DE TEST

```bash
# Test build
cd interne
npm run build

# Test dev avec clean localStorage
# Ouvrir DevTools → Application → Storage → localStorage → Clear All
# Puis recharger page et tester login

# Test API calls
# Ouvrir DevTools → Network
# Vérifier que token est envoyé dans Authorization header
```

---

## ⏱️ EFFORT TOTAL

- Tâche 1 (Supprimer apiClient): 5 min
- Tâche 2 (Fix Prisma): 10 min
- Tâche 3 (Nettoyer localStorage): 20 min
- Tâche 4 (Audit apiClient): 15 min
- Tâche 5 (Routes backend): 10 min
- Tâche 6 (Documentation): 15 min
- **TOTAL: ~75 min = 1.25h**

