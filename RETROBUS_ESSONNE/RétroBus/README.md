# 📧 RétroBus Mail

Service de mail interne pour l'association RétroBus Essonne.

Chaque utilisateur RétroBus a un compte mail interne et peut envoyer/recevoir des mails via une interface web moderne.

## 🎯 Caractéristiques

- ✅ **Webmail moderne** - Interface web React
- ✅ **Authentification intégrée** - Utilisateurs RétroBus existants
- ✅ **SMTP/IMAP** - Support complet du protocole mail
- ✅ **Envoi externe** - Envoyer des mails à @gmail, @outlook, etc.
- ✅ **Templates configurables** - Notifications, rapports automatiques
- ✅ **Mobile responsive** - Fonctionne sur téléphone/tablette
- ✅ **Intégration RétroBus** - Redirection depuis MyRBE

## 📂 Structure

```
RétroBus/
├── frontend/                  # App React (Webmail)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── backend/                   # API Node.js/Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── mail.js
│   │   │   └── templates.js
│   │   ├── services/
│   │   │   ├── smtp.js
│   │   │   ├── imap.js
│   │   │   └── mailer.js
│   │   ├── models/
│   │   ├── middleware/
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── shared/                    # Types & Utils partagés
│   ├── constants.js
│   └── types.js
│
└── docker-compose.yml        # Pour SMTP/IMAP local (optionnel)
```

## 🚀 Démarrage rapide

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔌 Integration avec MyRBE

Sur la carte RétroBus dans MyRBE, ajouter :
```jsx
<Button 
  leftIcon={<MdMail />}
  onClick={() => window.open('https://mail.retrobus.local')}
>
  Webmail
</Button>
```

## 📧 Configuration Mail

### Variables d'environnement (`.env`)

```env
# Serveur SMTP/IMAP
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USER=retrobus@retrobus.local
MAIL_PASSWORD=****

# Frontend
FRONTEND_URL=https://mail.retrobus.local
BACKEND_URL=https://api.retrobus.local

# JWT
JWT_SECRET=your-secret-key

# BD
DB_URL=postgresql://user:pass@localhost:5432/retrobus_mail
```

## 🛠️ Stack

**Frontend:**
- React 18+
- Chakra UI
- React Router
- Vite

**Backend:**
- Node.js
- Express
- Sequelize (ORM)
- nodemailer
- imap

**Infrastructure:**
- PostgreSQL
- Postfix/Dovecot (mail server optionnel)

## 📝 Roadmap

- [ ] Setup initial (frontend + backend)
- [ ] Authentification intégrée
- [ ] Interface Webmail basique
- [ ] SMTP/IMAP connection
- [ ] Envoi/réception mails
- [ ] Templates automatiques
- [ ] Intégration MyRBE
- [ ] Déploiement production

---

**C'est parti ! 🚀**
