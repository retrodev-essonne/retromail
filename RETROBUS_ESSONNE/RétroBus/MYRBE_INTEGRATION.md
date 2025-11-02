# Intégration MyRBE → RétroBus Mail

Guide pour intégrer l'accès à RétroBus Mail depuis MyRBE de manière sécurisée.

## 🔐 Flux d'authentification

```
MyRBE (Login) 
    ↓
[Utilisateur vérifié]
    ↓
Générer JWT token
    ↓
Rediriger vers: retromail.votredomaine.fr/?token=JWT_TOKEN
    ↓
Frontend valide le token avec le backend
    ↓
Accès granted ✅
```

## 📋 Étapes d'intégration

### 1. Ajouter le bouton dans MyRBE

Dans ton app MyRBE, ajouter un lien vers RétroBus Mail:

```jsx
// Dans un composant MyRBE
import React from 'react'

function AccessRétroMail({ userToken }) {
  const handleAccessMail = () => {
    const retroMailUrl = new URL('https://retromail.votredomaine.fr')
    retroMailUrl.searchParams.append('token', userToken)
    window.open(retroMailUrl.toString(), '_blank')
  }

  return (
    <button 
      className="btn-primary"
      onClick={handleAccessMail}
    >
      📧 Accéder à RétroBus Mail
    </button>
  )
}

export default AccessRétroMail
```

### 2. Endpoint de validation backend

Assurer que le backend a cet endpoint:

```javascript
// backend/src/routes/auth.js
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token manquant' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, error: 'Utilisateur non trouvé' })
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    return res.status(401).json({ success: false, error: error.message })
  }
})
```

### 3. Configuration CORS sécurisée

```javascript
// backend/src/index.js
const cors = require('cors')

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://retromail.votredomaine.fr',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### 4. Variables d'environnement

`.env` du backend:

```env
JWT_SECRET=your_256_bit_secret_key_min_32_chars
CORS_ORIGIN=https://retromail.votredomaine.fr
JWT_EXPIRY=24h
```

## 🛡️ Mesures de sécurité

### Token JWT

- ✅ Signé avec clé secrète (32+ caractères)
- ✅ Expiration de 24h
- ✅ Transporté via HTTPS uniquement
- ✅ Stocké en localStorage (sécurisé pour ce cas)

### URL d'accès

```
❌ MAUVAIS:  https://retromail.votredomaine.fr/token=xyz
❌ MAUVAIS:  https://retromail.votredomaine.fr/login?email=user
✅ BON:     https://retromail.votredomaine.fr/?token=xyz
```

### En-têtes de sécurité

Configurés automatiquement dans NGINX:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

## 🧪 Test manuel

### 1. Générer un token de test

```bash
# Script Node pour générer un token
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: 1, email: 'test@retrobus.fr' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
console.log('Token:', token);
"
```

### 2. Tester l'URL

```
https://retromail.votredomaine.fr/?token=YOUR_TOKEN_HERE
```

### 3. Vérifier la validation

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://retromail.votredomaine.fr/api/auth/verify
```

## 📊 Logs d'authentification

Ajouter du logging pour debugging:

```javascript
// backend/src/routes/auth.js
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    console.log('[AUTH] Token reçu:', token ? 'Oui' : 'Non')
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('[AUTH] Token valide pour utilisateur:', decoded.userId)
    
    // ...
  } catch (error) {
    console.error('[AUTH] Erreur:', error.message)
    res.status(401).json({ success: false })
  }
})
```

## ⚠️ Limitations intentionnelles

1. **Pas d'index public**: Le site n'apparaît pas dans les moteurs de recherche
2. **Token requis**: Impossible d'accéder sans authentification MyRBE
3. **HTTPS obligatoire**: Aucune connexion non-chiffrée
4. **Domaine dédié**: Accès uniquement via retromail.votredomaine.fr

## 🔄 Renouvellement de token

Si le token expire pendant la session:

```javascript
// frontend/src/lib/auth.js
export async function refreshToken() {
  try {
    const response = await axios.post('/api/auth/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('retromail_token')}`
      }
    })
    const newToken = response.data.token
    localStorage.setItem('retromail_token', newToken)
    return newToken
  } catch (error) {
    // Rediriger vers login
    window.location.href = '/'
  }
}
```

## 📞 Support

Pour des problèmes d'authentification:

1. Vérifier le JWT_SECRET (identique MyRBE et RétroBus Mail)
2. Vérifier les logs du backend
3. Vérifier que HTTPS est actif
4. Vérifier que le token n'est pas expiré
