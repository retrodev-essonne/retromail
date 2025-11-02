# 📋 Analyse Complète de l'Architecture - INTERNE

**Date**: 2 Novembre 2025  
**Scope**: Audit complet de `interne/` - Frontend React + Backend Express

---

## 🎯 Résumé Exécutif

L'application présente **plusieurs incohérences architecturales** et **patterns contradictoires** qui affectent la maintenance et la fiabilité. L'application fonctionne malgré ces problèmes, mais nécessite un **nettoyage architectural**.

### 🔴 Criticité: **MOYEN-ÉLEVÉ**
- **Pas de bugs évidents** mais **risques de régressions**
- **Code duplicatif** et **patterns non-uniformes**
- **Configurations confuses** et **fallbacks chaîtés**

---

## 🔍 FAILLES IDENTIFIÉES

### 1️⃣ **INCOHÉRENCE CRITIQUE: Plusieurs API Clients**

**Problème**: Existence de 3+ implémentations API concurrentes

#### ❌ Fichiers en conflit:
```
interne/src/api/config.js           ✅ Moderne - apiClient avec localStorage
interne/src/apiClient.js            ⚠️  Ancien - API_BASE_URL avec logique dev
interne/api/src/api/server.js      ✅ Backend correct
```

#### 📍 Locations du problème:

**A) `src/api/config.js` (PRINCIPAL - Recommandé)**
```javascript
// Récupère token de localStorage dans chaque requête
const token = localStorage.getItem('token');
const headers = token 
  ? getAuthHeaders(token, options)
  : getDefaultHeaders(options);
```
✅ Correct - cohérent avec `UserContext`

**B) `src/apiClient.js` (ANCIENNE VERSION - À ÉVITER)**
```javascript
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' ...);
const API_BASE_URL = (
  isLocal ? (import.meta.env?.VITE_API_URL || '') : ''
).replace(/\/$/, '');
```
⚠️ Confusion entre `isLocal` et configuration - inutilisé

**Impact**: 
- Code legacy non maintenu
- Confusion sur quelle API client utiliser
- Risque que certaines pages utilisent l'ancienne version

#### ✅ SOLUTION:
1. Audit: Vérifier quelle est réellement utilisée
2. **Supprimer `src/apiClient.js`** - consolidé dans `src/api/config.js`
3. Uniformiser tous les imports

---

### 2️⃣ **DOUBLE STOCKAGE DE CONFIGURATION D'API**

**Problème**: Configuration API stockée en localStorage ET .env

#### Locations:
```javascript
// SiteManagement.jsx - Stockage localStorage pour tunning manuel
localStorage.getItem('rbe_api_origin')           // URL de base API
localStorage.getItem('rbe_api_prefix')           // Préfixe API (/api, /v1, etc)
localStorage.getItem('rbe_api_site_users_path')  // Path endpoint
localStorage.getItem('rbe_api_members_path')     // Path endpoint
localStorage.getItem('rbe_api_changelog_path')   // Path endpoint
// ... 7+ clés localStorage de configuration

// .env - Configuration de dev
VITE_API_URL                 // API base
VITE_API_PREFIX              // Préfixe
VITE_API_SITE_USERS_PATH    // Path
VITE_API_MEMBERS_PATH        // Path
// ... même chose dans .env
```

#### 🎯 Pattern:
```javascript
const getApiPrefix = () => clean(
  localStorage.getItem('rbe_api_prefix') ||  // ← Priorité 1: localStorage
  import.meta.env?.VITE_API_PREFIX            // ← Priorité 2: .env
);
```

**Problèmes**:
- localStorage persiste entre déploiements
- Confusion en production (quelle config est active?)
- SiteManagement.jsx permet de tuner manuellement
- Fallback chaîtés = debugging difficile

#### ✅ SOLUTION:
1. **Nettoyer localStorage** au démarrage (gardez seulement `token` + `user`)
2. Utiliser **variables d'environnement uniquement** pour configuration API
3. Ajouter un endpoint `/api/config` pour obtenir les infos au runtime
4. **Supprimer la page de "tunning manuel d'API"** de SiteManagement.jsx

---

### 3️⃣ **PATTERNS FETCH CHAÎTÉS ET FALLBACKS IMPLICITES**

**Problème**: Logique "try multiple endpoints" implémentée 3 fois

#### Locations:
```
A) src/api/config.js           - apiClient simple
B) src/api/members.js          - tryEndpoints() avec boucle fallback
C) src/pages/SiteManagement.jsx - apiGet/apiPost/apiPut avec chaînage
D) src/pages/MyRBEActions.jsx   - PATCH try, fallback à POST
```

#### Exemple de duplication (MyRBEActions.jsx):
```javascript
// PATCH avec fallback à POST
try {
  const r = await fetch(`${API}/vehicles/${parc}/usages`, {
    method: "PATCH",
    ...
  });
  if (r.ok) usageResult = await r.json();
} catch (err) {
  // fallback to POST
  const r2 = await fetch(`${API}/vehicles/${parc}/usages`, {
    method: "POST",
    ...
  });
  if (r2.ok) usageResult = await r2.json();
}
```

**Problèmes**:
- Code dupliqué dans 4 endroits
- Debugging difficile (où l'erreur vient-elle?)
- Pas d'indication visuelle du fallback utilisé
- Incohérent: parfois `/api/`, parfois sans

#### ✅ SOLUTION:
Centraliser dans `src/api/config.js`:
```javascript
export const apiClient = {
  getWithFallback: async (primaire, fallback) => {
    try { return await apiClient.get(primaire); }
    catch { return await apiClient.get(fallback); }
  },
  // ...
}
```

---

### 4️⃣ **INCOHÉRENCE ROUTES BACKEND SANS `/api`**

**Problème**: Routes backend avec ET sans `/api` prefix

#### Routes enregistrées dans `server.js`:
```javascript
// ✅ AVEC /api
app.use('/api/notifications', notificationsRouter);
app.use('/api/email-templates', emailTemplatesRouter);
app.use('/api/finance', finance);
app.use('/api/site-users', siteUsersRouter);

// ❌ SANS /api (alias pour fallback?)
app.use('/finance', finance);
app.use('/site-users', siteUsersRouter);

// 🤔 Certaines routes directes:
app.get('/retromail/list', ...);
app.use('/retromail', express.static(...));
```

**Problèmes**:
- Confusion: quelle route utiliser?
- Impossible de nettoyer sans cassure client
- `/finance` vs `/api/finance` qui est officiel?
- Maintenance: 2x le code

#### ✅ SOLUTION:
1. **Décider d'une convention**: TOUS les endpoints doivent être `/api/*`
2. Supprimer les alias
3. Documenter la structure

Proposition:
```
/api/finance       - Gestion financière
/api/notifications - Notifications
/api/email-templates - Templates email
/api/site-users    - Utilisateurs du site
/api/members       - Membres
/api/vehicles      - Véhicules
/api/events        - Événements
/api/stocks        - Stocks
/api/retro-reports - Rapports RétroBus
/api/flashes       - Annonces flash
/api/newsletter    - Newsletter
```

---

### 5️⃣ **INCONSISTANCE PATTERN RÉPONSES API**

**Problème**: Formats de réponse API non uniformes

#### Exemples du code:
```javascript
// Exemple 1: stocksAPI
const stocksAPI = {
  getAll: (params) => apiClient.get(`/api/stocks${toQuery(params)}`),
};
// Retour: { id, name, quantity, ... } ou { stocks: [...] }?

// Exemple 2: membersAPI
async getAll() {
  // Renvoie { members: [...] } pour adapter au code existant
}

// Exemple 3: DELETE response
if (contentLength === '0' || response.status === 204) {
  return { success: true };
}
return await parseResponse(response);

// Exemple 4: flashAPI
getActive: async () => apiClient.get('/flashes')  // Array ou { flashes: [...] }?
```

**Problèmes**:
- Pages ne savent pas quelle structure attendre
- Parsing inconsistant (parfois `.data`, parfois `.flashes`)
- Erreurs de mapping

#### ✅ SOLUTION:
Documenter réponses standard:
```
GET /api/resource
Response: { data: [...], total?: number, page?: number }

POST /api/resource
Response: { data: { id, ... }, created: true }

DELETE /api/resource
Response: { deleted: true, id }

Error:
Response: { error: string, status: number, details?: string }
```

---

### 6️⃣ **TYPESCRIPT MIXTE AVEC JAVASCRIPT**

**Problème**: Fichiers `.ts` et `.jsx` mélangés sans cohérence

#### Locations:
```
tsconfig.ts       ✅ Existe
tsconfig.node.ts  ✅ Existe
vite.config.ts    ⚠️ Existe ET vite.config.js

Mais composants:
src/App.jsx       - JS (pas de .tsx)
src/pages/*.jsx   - JS
src/components/*.jsx - JS
src/context/*.jsx - JS

SAUF:
src/components/Header.tsx  - 1 seul fichier TypeScript
```

**Problèmes**:
- TypeScript configuré mais non utilisé
- 1 fichier `.tsx` perdu au milieu de `.jsx`
- Outils confus (eslint, vite, prisma)
- Maintenance: commande build peut fail

#### ✅ SOLUTION:
**Option A - Standardiser sur JavaScript** (Plus rapide)
1. Supprimer `.tsx` files
2. Renommer `src/components/Header.tsx` → `Header.jsx`
3. Supprimer `vite.config.ts`
4. Garder `tsconfig.json` pour eslint/tooling

**Option B - Standardiser sur TypeScript** (Idéal long-terme)
1. Convertir tous `.jsx` → `.tsx`
2. Ajouter types partout
3. Configurer strict mode TypeScript
*Effort: 3-4 jours*

---

### 7️⃣ **GESTION SESSION CONFUSE**

**Problème**: Token auth géré par localStorage ET UserContext

#### Pattern:
```javascript
// UserContext.jsx
const [token, setToken] = useState(() => localStorage.getItem('token'));

useEffect(() => {
  if (token) localStorage.setItem('token', token);
}, [token]);

// Mais aussi:
ensureSession() -> fetch /api/me  // Validation serveur

// Mais aussi dans apiClient.get():
const token = localStorage.getItem('token');
// Directement du localStorage, pas du context!
```

**Problèmes**:
- Token peut être désynchronisé entre localStorage et state
- 2 sources de vérité (local storage + context + serveur)
- Pas clair qui valide quoi
- Race conditions possibles

#### ✅ SOLUTION:
```javascript
// UNIQUE source de vérité: UserContext
export function useUser() {
  const { token } = useContext(UserContext);
  return { token };  // Token toujours du context
}

// Dans apiClient:
export const apiClient = {
  setAuthToken(token) { this.token = token; },
  get: async (url) => {
    const headers = this.token 
      ? { Authorization: `Bearer ${this.token}` }
      : {};
  }
};

// À la connexion:
setToken(newToken);  // Sauvegarde en localStorage ET context
apiClient.setAuthToken(newToken);
```

---

### 8️⃣ **PRISMA + DÉPLOIEMENT RAILWAY UNCHECKED**

**Problème**: Script Prisma peut être fragile

#### Dans `api/package.json`:
```json
"scripts": {
  "prisma:push": "prisma db push",
  "start:fresh": "npm run prisma:generate && npm run prisma:push && npm run seed && node ./src/server.js"
}
```

**Problèmes**:
- `prisma db push` en prod = danger (modifie schema)
- Pas de migrations
- Pas de rollback
- Seed peut dupliquer données

#### ✅ SOLUTION:
```bash
# Utiliser migrations au lieu de db push
npm run prisma:migrate:dev     # Local dev
npm run prisma:migrate:deploy  # Production
```

---

### 9️⃣ **VITE PROXY VS VERCEL REDIRECT**

**Problème**: Config Vite compliquée pour resolver API

#### `vite.config.js`:
```javascript
proxy: {
  '/api': { target: DEV_API_TARGET, ... },
  '/v1': { target: DEV_API_TARGET, ... },
  '/auth': { target: DEV_API_TARGET, ... },
  '/retromail': { target: DEV_API_TARGET, ... },
  '/events': { target: DEV_API_TARGET, ... },
  // ... 10+ routes proxy
}

// ET vercel.json:
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "..." }
  ]
}
```

**Problèmes**:
- Maintenir 2 fichiers en sync
- Ajouter route = 2 places à modifier
- Production (Vercel) != dev (Vite)
- Difficult à déboguer

#### ✅ SOLUTION:
Utiliser une seule stratégie:
```javascript
// Option A: Tout via /api en production
// Option B: Tout via apiClient avec VITE_API_URL en dev

// Recommandé:
const API_URL = import.meta.env.VITE_API_URL || '/api';
// En prod: VITE_API_URL=https://api.retrobus.fr
// En dev: VITE_API_URL=http://localhost:3001
```

---

### 🔟 **PERTE DE CONTEXTE API EN PAGES PROFONDES**

**Problème**: Certaines pages font fetch direct au lieu d'utiliser apiClient

#### Locations:
```javascript
// ❌ MyRBEActions.jsx - Direct fetch
const r = await fetch(`${API}/vehicles/${encodeURIComponent(parc)}/usages`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-user-matricule": ... }
});

// ❌ AdminFinance.jsx - Aussi direct fetch
const res = await fetch(apiUrl(p), init);

// ✅ SiteManagement.jsx - Essaie apiClient
const res = await apiClient.post(url, data, config);
```

**Problèmes**:
- Token peut ne pas être passé
- Erreurs 401 pas gérées uniformément
- CORS issues potentielles
- Logging inconsistant

#### ✅ SOLUTION:
**Toujours utiliser `apiClient` du fichier config**
```javascript
// Au lieu de:
await fetch(url, { headers: { Auth: ... } })

// Faire:
import { apiClient } from '../api/config';
await apiClient.get(url);  // Token inclus automatiquement
```

---

## 📊 TABLEAU RÉCAPITULATIF

| # | Faille | Sévérité | Impact | Effort Fix |
|---|--------|----------|--------|-----------|
| 1 | Multiples API clients | 🔴 Élevé | Confusion, refactor cyclique | 2h |
| 2 | Double config (localStorage + .env) | 🟡 Moyen | Bugs en prod, debugging | 3h |
| 3 | Fallbacks chaîtés (3 implémentations) | 🟡 Moyen | Code dupliqué, maintenance | 4h |
| 4 | Routes `/api` vs sans `/api` | 🟡 Moyen | Routes confuses | 2h |
| 5 | Formats réponse API inconsistants | 🟡 Moyen | Erreurs mapping | 2h |
| 6 | TypeScript non exploité | 🟢 Bas | Refactor futur | 16h |
| 7 | Gestion session confuse | 🟡 Moyen | Race conditions | 3h |
| 8 | Prisma `db push` en prod | 🔴 Élevé | Danger crash data | 1h |
| 9 | Vite proxy vs Vercel mismatch | 🟡 Moyen | Dev/prod différent | 2h |
| 10 | Fetch direct au lieu apiClient | 🟡 Moyen | Perte context, auth issues | 5h |

---

## ✅ PLAN DE CORRECTION PRIORITISÉ

### Phase 1: URGENT (1-2 jours)
- [ ] **Faille #8**: Remplacer `prisma db push` par migrations
- [ ] **Faille #1**: Audit + Supprimer `src/apiClient.js`
- [ ] **Faille #2**: Nettoyer localStorage (garder token+user seulement)

### Phase 2: IMPORTANT (2-3 jours)
- [ ] **Faille #3**: Centraliser fallbacks dans apiClient
- [ ] **Faille #4**: Standardiser toutes routes à `/api/*`
- [ ] **Faille #10**: Convertir fetch direct → apiClient

### Phase 3: MAINTENANCE (3-5 jours)
- [ ] **Faille #5**: Documenter + uniformiser formats réponse
- [ ] **Faille #7**: Simplifier gestion session (localStorage → context)
- [ ] **Faille #6**: Décider TypeScript vs JavaScript
- [ ] **Faille #9**: Unifier Vite proxy + Vercel redirects

---

## 📝 RECOMMANDATIONS ADDITIONNELLES

### 1. Error Handling
- Créer `src/lib/errors.js` centralisé
- Logger erreurs de manière uniforme
- Afficher user-friendly messages

### 2. Testing
- Ajouter tests API (mock fetch)
- Tests d'authentification
- Tests d'intégration principales pages

### 3. Documentation
- Créer `/docs/API.md` - documentation endpoints
- Créer `/docs/ARCHITECTURE.md` - décisions tech
- Créer `/docs/ENV.md` - variables d'environnement

### 4. Monitoring
- Ajouter Sentry ou similaire
- Logger 401/403/500 errors
- Alert si API unreachable

---

## 🎯 CONCLUSION

L'application **fonctionne** mais présente des **incohérences** qui vont s'amplifier. Le nettoyage architecturel recommandé prendra **~2 semaines** pour Phase 1+2, et **+2 semaines** pour Phase 3.

**Priorité immédiate**: Faille #8 (Prisma) + Faille #1 (API clients)

