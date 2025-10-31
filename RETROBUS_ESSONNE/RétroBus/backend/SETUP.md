# 🚀 Configuration RétroBus Mail Backend

## Prérequis
- **Node.js** 16+ 
- **npm** ou **yarn**
- **PostgreSQL** (connexion prête)
- **Serveur SMTP** (Gmail, Outlook, ou serveur personnel)

## 1️⃣ Installation

```bash
cd backend
npm install
```

## 2️⃣ Configuration Environnement

Créer le fichier `.env` à la racine du dossier `backend/`:

```bash
cp .env.example .env
```

Éditer `.env` avec vos paramètres:

```env
# === SERVEUR MAIL ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
SMTP_FROM_EMAIL=retrobus@essonne.fr
SMTP_SECURE=false

# === IMAP (Réception) ===
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=votre-email@gmail.com
IMAP_PASSWORD=votre-mot-de-passe-app

# === BASE DE DONNÉES ===
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retrobus_mail
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe

# === APPLICATION ===
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# === AUTHENTIFICATION ===
JWT_SECRET=votre-secret-jwt-très-complexe-ici
JWT_EXPIRY=7d

# === API RETROBUS ===
RETROBUS_API_URL=http://localhost:3000/api
RETROBUS_API_KEY=votre-cle-api-retrobus

# === LOGS ===
LOG_LEVEL=debug
```

### Configuration Gmail
Si vous utilisez Gmail:
1. Activer [2FA](https://myaccount.google.com/security)
2. Générer un [mot de passe d'application](https://myaccount.google.com/apppasswords)
3. Utiliser ce mot de passe dans `SMTP_PASSWORD` et `IMAP_PASSWORD`

### Configuration Serveur Personnel
Pour utiliser un serveur Postfix/Sendmail local:
```env
SMTP_HOST=mail.retrobus.local
SMTP_PORT=25 (ou 587 pour soumission)
SMTP_SECURE=false
```

## 3️⃣ Démarrage

### Développement (avec hot reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

L'API sera disponible à: `http://localhost:3001`

Vérifier la santé du serveur:
```bash
curl http://localhost:3001/health
```

## 4️⃣ Structure du Code

```
src/
├── index.js                 # Point d'entrée Express
├── routes/
│   ├── auth.js             # Authentification JWT
│   ├── mail.js             # CRUD emails
│   └── templates.js        # Gestion templates
├── services/
│   ├── mailer.js           # Service SMTP/IMAP
│   ├── database.js         # Connexion PostgreSQL
│   └── imapSync.js         # Synchronisation IMAP (TODO)
├── models/
│   ├── User.js             # Modèle utilisateur (TODO)
│   └── Email.js            # Modèle email (TODO)
└── middleware/
    └── auth.js             # Middleware JWT (TODO)
```

## 5️⃣ Endpoints API

### 🔐 Authentification
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/verify` - Vérifier le token
- `GET /api/auth/profile` - Profil utilisateur

### 📧 Emails
- `GET /api/mail/inbox` - Récupérer les emails reçus
- `GET /api/mail/email/:id` - Détail d'un email
- `POST /api/mail/send` - Envoyer un email
- `POST /api/mail/reply` - Répondre à un email
- `DELETE /api/mail/email/:id` - Supprimer un email
- `POST /api/mail/sync` - Synchroniser depuis IMAP

### 🎨 Templates
- `GET /api/templates` - Tous les templates
- `GET /api/templates/:id` - Template spécifique
- `POST /api/templates` - Créer un template
- `PUT /api/templates/:id` - Modifier un template
- `DELETE /api/templates/:id` - Supprimer un template

## 6️⃣ Test avec cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@retrobus.fr","password":"password123"}'
```

### Envoyer un email
```bash
curl -X POST http://localhost:3001/api/mail/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to":"recipient@example.com",
    "subject":"Test email",
    "body":"<p>Ceci est un test</p>"
  }'
```

## 🐛 Debugging

Activer les logs détaillés en développement:
```bash
LOG_LEVEL=debug npm run dev
```

Vérifier la connexion SMTP:
```bash
node -e "
import mailer from './src/services/mailer.js';
mailer.transporter.verify((err, ok) => {
  if (err) console.error('SMTP Error:', err);
  else console.log('SMTP OK');
});
"
```

## 📚 Ressources

- [Express.js Docs](https://expressjs.com/)
- [nodemailer Guide](https://nodemailer.com/)
- [JWT Authentication](https://jwt.io/)
- [Sequelize ORM](https://sequelize.org/)

## 🆘 Troubleshooting

**SMTP Connection Failed**
- Vérifier host, port, credentials
- Vérifier pare-feu (port 587 ou 465)
- Pour Gmail: utiliser mot de passe d'application

**Database Connection Error**
- Vérifier PostgreSQL est lancé
- Vérifier credentials dans `.env`
- Vérifier base de données existe

**JWT Token Expired**
- Vérifier `JWT_EXPIRY` dans `.env`
- Augmenter la durée si nécessaire
- Client doit faire refresh du token

---

**Status**: ✅ Backend ready for development
