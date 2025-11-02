#!/bin/bash

# 🚀 Script de déploiement RétroBus Mail

set -e

echo "🚀 Déploiement RétroBus Mail"
echo "=============================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier les prérequis
echo -e "${YELLOW}Vérification des prérequis...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js et npm trouvés${NC}"

# Installer les dépendances backend
echo -e "\n${YELLOW}Installation backend...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend prêt${NC}"

# Construire le frontend
echo -e "\n${YELLOW}Construction frontend...${NC}"
cd ../frontend
npm install
npm run build
echo -e "${GREEN}✅ Frontend construit${NC}"

# Migrer la base de données
echo -e "\n${YELLOW}Migration base de données...${NC}"
cd ../backend
npx prisma migrate deploy
echo -e "${GREEN}✅ Base de données migrée${NC}"

echo -e "\n${GREEN}=============================="
echo -e "✅ Déploiement terminé!"
echo -e "=============================="
echo -e ""
echo -e "Prochaines étapes:"
echo -e "1. Placer le GIF dans: frontend/public/splash.gif"
echo -e "2. Configurer le domaine retromail.votredomaine.fr"
echo -e "3. Démarrer le backend: npm run dev"
echo -e "4. Servir le frontend depuis NGINX"
echo -e ""
echo -e "Documentation: DEPLOYMENT.md${NC}"
