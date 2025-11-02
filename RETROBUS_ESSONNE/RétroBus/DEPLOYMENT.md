# Déploiement RétroBus Mail

Guide complet pour mettre en ligne RétroBus Mail avec un domaine personnalisé.

## 🌐 Configuration du domaine

### Étape 1: DNS

Ajouter un enregistrement DNS A pointant vers votre serveur:

```dns
retromail.votredomaine.fr  A  xx.xxx.xxx.xxx
```

### Étape 2: Certificat SSL

Utiliser Let's Encrypt pour un certificat gratuit:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d retromail.votredomaine.fr
```

## 🚀 Déploiement avec NGINX

### Configuration NGINX

Créer `/etc/nginx/sites-available/retromail`:

```nginx
upstream retromail_api {
    server localhost:3000;
}

upstream retromail_frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name retromail.votredomaine.fr;
    
    # Rediriger HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name retromail.votredomaine.fr;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/retromail.votredomaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/retromail.votredomaine.fr/privkey.pem;

    # Configuration SSL recommandée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logs
    access_log /var/log/nginx/retromail_access.log;
    error_log /var/log/nginx/retromail_error.log;

    # Frontend
    location / {
        proxy_pass http://retromail_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://retromail_api/api/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sécurité: Bloquer l'accès direct au serveur
    # Ne pas indexer cette page
    location /robots.txt {
        return 200 "User-agent: *\nDisallow: /\n";
        add_header Content-Type text/plain;
    }
}
```

### Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/retromail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🐳 Déploiement avec Docker

### Dockerfile Frontend

```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=https://retromail.votredomaine.fr/api
    networks:
      - retromail

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/retromail
      - JWT_SECRET=your_secret_key_here
      - NODE_ENV=production
    depends_on:
      - db
    networks:
      - retromail

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=retromail
      - POSTGRES_USER=retromail_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - retromail

networks:
  retromail:
    driver: bridge

volumes:
  postgres_data:
```

## 🔐 Variables d'environnement

### Frontend (.env.production)

```env
VITE_API_URL=https://retromail.votredomaine.fr/api
```

### Backend (.env)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/retromail
JWT_SECRET=your_very_secure_secret_key_here_with_min_32_chars
CORS_ORIGIN=https://retromail.votredomaine.fr
```

## 📊 Monitoring

### Logs NGINX

```bash
# Logs en temps réel
tail -f /var/log/nginx/retromail_access.log
tail -f /var/log/nginx/retromail_error.log
```

### Renouvellement SSL automatique

```bash
# Cron job pour renouveler le certificat
0 2 * * * /usr/bin/certbot renew --quiet
```

## ⚠️ Sécurité

1. **Authentification**: Seuls les tokens MyRBE valides peuvent accéder
2. **HTTPS obligatoire**: Tous les appels sont chiffrés
3. **Headers de sécurité**: Configurés dans NGINX
4. **Pas d'indexation**: robots.txt bloque les moteurs de recherche
5. **CORS restreint**: Limité au domaine retromail uniquement

## 🧪 Test de déploiement

```bash
# Test SSL
curl -I https://retromail.votredomaine.fr

# Test API
curl -I https://retromail.votredomaine.fr/api/health

# Vérifier les headers de sécurité
curl -I https://retromail.votredomaine.fr | grep -i "strict-transport"
```

## 📝 Checklist de déploiement

- [ ] Domaine DNS configuré
- [ ] Certificat SSL installé
- [ ] NGINX configuré et testé
- [ ] Base de données créée et migrée
- [ ] Variables d'environnement définies
- [ ] Application frontend construite
- [ ] Application backend démarrée
- [ ] Monitoring et logs configurés
- [ ] Certificat SSL auto-renouvellement configuré
- [ ] Test d'accès au site
- [ ] Test de connexion via token

## 🆘 Dépannage

### "Connexion refusée"
- Vérifier que le frontend et backend tournent
- Vérifier les ports (3000 et 5173)
- Vérifier la configuration NGINX

### "Certificat expiré"
- Renouveler manuellement: `certbot renew`
- Vérifier le cron de renouvellement

### "Authentification échouée"
- Vérifier le token MyRBE
- Vérifier JWT_SECRET au démarrage du backend
- Vérifier les logs d'erreur du backend
