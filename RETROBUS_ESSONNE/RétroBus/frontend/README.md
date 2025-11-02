# RétroBus Mail Frontend

Interface web simple et minimaliste pour RétroBus Mail, accessible uniquement via MyRBE.

## Caractéristiques

- 🎨 **Design minimaliste** - Interface claire et simple
- 🔐 **Sécurité** - Accessible uniquement via token MyRBE
- 📱 **Responsive** - Fonctionne sur tous les appareils
- ⚡ **Rapide** - Construit avec Vite et React
- 🌐 **Multilingue** - Interface en français

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Construction

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

## Configuration

Créer un fichier `.env.local` avec les variables d'environnement:

```env
VITE_API_URL=http://localhost:3000/api
```

## Structure

```
src/
├── components/
│   ├── SplashScreen.jsx       # Écran de démarrage avec GIF
│   ├── MailApp.jsx            # Application principale
│   ├── MailList.jsx           # Liste des messages
│   └── MailViewer.jsx         # Visualiseur de message
├── lib/
│   ├── api.js                 # Appels API
│   └── auth.js                # Gestion authentification
├── App.jsx                    # Composant principal
└── main.jsx                   # Point d'entrée
```

## Authentification

L'authentification se fait via un token MyRBE passé en paramètre d'URL:

```
https://retromail.votredomaine.fr/?token=YOUR_TOKEN_HERE
```

## Domaine personnalisé

Pour configurer votre domaine personnalisé (ex: `retromail.votredomaine.fr`):

1. Configurer le DNS pour pointer vers votre serveur
2. Configurer NGINX/Apache pour servir cette application
3. Configurer SSL/TLS (Let's Encrypt recommandé)

Voir `DEPLOYMENT.md` pour plus de détails.
