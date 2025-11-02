# 📧 RétroBus Mail - Structure complète

## 📁 Arborescence

```
RétroBus/
├── backend/                      # API Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── notifications.js  # Routes mail
│   │   │   └── auth.js           # Authentification
│   │   ├── services/
│   │   │   └── notificationService.js
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma         # Modèles DB
│   │   └── migrations/
│   ├── package.json
│   └── .env.example
│
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── SplashScreen.jsx  # Écran de démarrage + GIF
│   │   │   ├── MailApp.jsx       # App principale
│   │   │   ├── MailList.jsx      # Liste des messages
│   │   │   └── MailViewer.jsx    # Visualiseur
│   │   ├── lib/
│   │   │   ├── api.js            # Appels API
│   │   │   └── auth.js           # Gestion token
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── splash.gif            # Ton GIF de démarrage
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── shared/                       # Utilitaires partagés
│
├── DEPLOYMENT.md                 # Guide déploiement
├── MYRBE_INTEGRATION.md         # Intégration MyRBE
└── README.md

```

## 🎯 Fonctionnalités

### Frontend
- ✅ Splash screen avec ton GIF (3 secondes minimum)
- ✅ Spinner de chargement
- ✅ Interface mail minimaliste
- ✅ Authentification par token MyRBE
- ✅ Responsive design
- ✅ Thème gradient purple/blue

### Backend
- ✅ Validation JWT
- ✅ Routes de notification
- ✅ Service mail interne
- ✅ Prisma ORM
- ✅ PostgreSQL

### Sécurité
- ✅ HTTPS obligatoire
- ✅ Token MyRBE requis
- ✅ CORS restreint
- ✅ Headers de sécurité
- ✅ Pas d'indexation (noindex)

## 🚀 Démarrage rapide

### Développement local

```bash
# Terminal 1: Backend
cd RétroBus/backend
npm install
npm run dev

# Terminal 2: Frontend
cd RétroBus/frontend
npm install
npm run dev

# Terminal 3: Base de données (optionnel, si local)
# Utiliser Docker:
docker run -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:15
```

### Production

Voir `DEPLOYMENT.md` pour:
- Configuration NGINX
- Docker Compose
- Certificat SSL
- Configuration domaine

## 🔐 Authentification

### Workflow

1. Utilisateur clique sur "Accéder à RétroBus Mail" dans MyRBE
2. MyRBE génère un JWT token
3. Redirection vers: `retromail.votredomaine.fr/?token=JWT`
4. Frontend valide le token avec le backend
5. Si valide → Accès à l'app mail ✅
6. Si invalide → Message d'erreur

### Token JWT

- Généré par MyRBE
- Signé avec clé secrète (32+ chars)
- Expiré après 24h
- Inclus dans chaque requête API

## 📱 Interface utilisateur

### Page de splash (3 secondes)

```
+---------------------------+
|     [TON GIF ICI]         |
|                           |
|     [Spinner qui tourne]  |
|      Chargement...        |
+---------------------------+
```

### App principale

```
+---------------------------+
| RétroBus Mail  [Déconnect]|
+--+------------------------+
|📥| [Liste des messages]   |
|📤|                        |
|📦| De: Alice Dupont       |
|   | Objet: Réunion...     |
|   | Il y a 2 heures       |
+--+------------------------+
```

## 🎨 Couleurs

- Primary: `#667eea` (violet)
- Secondary: `#764ba2` (violet foncé)
- Background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Text: `#333333`

## 📊 Variables d'environnement

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/retromail
JWT_SECRET=your_256_bit_secret_min_32_chars
CORS_ORIGIN=https://retromail.votredomaine.fr
```

## 🧪 Tests

### Test d'authentification

```bash
# Générer un token de test
node -e "console.log(require('jsonwebtoken').sign({userId:1}, 'secret', {expiresIn:'24h'}))"

# Tester avec curl
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/auth/verify
```

### Test de la liste des messages

```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notifications
```

## 📚 Documentation complète

- `DEPLOYMENT.md` - Mise en production
- `MYRBE_INTEGRATION.md` - Intégration MyRBE
- `frontend/README.md` - Guide frontend
- `backend/README.md` - Guide backend

## ⚠️ Limitations intentionnelles

1. **Pas d'enregistrement**: Seul accès via MyRBE
2. **Pas d'indexation**: Invisible aux moteurs de recherche
3. **Connexion sécurisée**: HTTPS + JWT
4. **Domaine privé**: Seul retromail.votredomaine.fr accepté

## 🆘 Dépannage

| Problème | Solution |
|----------|----------|
| Erreur "Accès refusé" | Vérifier le token et JWT_SECRET |
| API inaccessible | Vérifier que backend tourne sur port 3000 |
| Certificat expiré | Renouveler: `certbot renew` |
| CORS error | Vérifier CORS_ORIGIN dans .env |

## 📝 Checklist avant production

- [ ] GIF démarrage placé dans `frontend/public/splash.gif`
- [ ] Domaine DNS configuré
- [ ] Certificat SSL installé
- [ ] Variables d'environnement définies
- [ ] Base de données créée et migrée
- [ ] NGINX/Nginx configuré
- [ ] Test d'accès via token MyRBE
- [ ] Logs de monitoring activés
- [ ] Certificat auto-renouvellement configuré

## 🎯 Prochaines étapes

1. ✅ Placer ton GIF dans `frontend/public/splash.gif`
2. ✅ Déployer le domaine retromail.votredomaine.fr
3. ✅ Tester l'intégration MyRBE
4. ✅ Ajouter des fonctionnalités (composer un mail, etc.)
5. ✅ Configurer le monitoring et les alertes
