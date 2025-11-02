# 🚌 Fonctionnalité : Ajouter un véhicule avec visibilité publique

## Description

Mise en place complète de la fonction "ajouter un véhicule" sur un template identique au premier véhicule, avec une **différence clé : afficher sur le site public ou non** !

## Changements effectués

### 1️⃣ **Backend (API)**

#### Modifications du modèle Prisma
- **Fichier**: `interne/api/prisma/schema.prisma`
- **Changement**: Ajout du champ `isPublic: Boolean @default(false)` au modèle `Vehicle`
- **Effet**: Permet de contrôler la visibilité d'un véhicule sur le site public

#### Modifications des endpoints
- **Fichier**: `interne/api/src/server.js`

**POST /vehicles (Création)**
- Accepte le paramètre `isPublic` dans le body
- Valeur par défaut : `false` (privé par défaut)

**PUT /vehicles/:parc (Modification)**
- Accepte la modification du champ `isPublic`
- Traite booléen correctement

**GET /public/vehicles (Liste publique)**
- Filtre maintenant avec `where: { isPublic: true }`
- Seuls les véhicules avec `isPublic: true` sont retournés

**GET /public/vehicles/:parc (Détail public)**
- Vérifie que le véhicule existe ET que `isPublic: true`
- Retourne 404 si le véhicule n'est pas public

**transformVehicle()**
- Inclut maintenant `isPublic: vehicle.isPublic || false` dans la transformation

### 2️⃣ **Frontend (React)**

#### Nouvelle page : VehiculeCreate.jsx
- **Fichier**: `interne/src/pages/VehiculeCreate.jsx`
- **Fonctionnalité**: Page complète pour créer un nouveau véhicule
- **Sections**:
  - 📋 Identité du véhicule (parc, marque, modèle, immat...)
  - 📝 Descriptions (description générale, historique)
  - ⚙️ Caractéristiques techniques
  - 🖼️ Galerie photos
  - 🌐 **Publication** (nouveau toggle pour afficher sur le site public)

#### Modifications VehiculeShow.jsx
- **Fichier**: `interne/src/pages/VehiculeShow.jsx`
- **Imports**: Ajout de `Switch`, `Card`, `CardBody` de Chakra UI
- **Nouvelle section**: Bloc "Publication" avec toggle `isPublic`
  - Affiche un message ✅ / 🔒 selon l'état
  - Mise à jour en temps réel dans le formulaire
- **Fonction save()**: Envoie maintenant le champ `isPublic` au backend

#### Modifications Dashboard.jsx
- **Fichier**: `interne/src/pages/Dashboard.jsx`
- **Changement**: Import remplacé `AddVehicule` → `VehiculeCreate`
- **Route**: `/dashboard/vehicules/ajouter` → `<VehiculeCreate />`

#### Modifications Vehicules.jsx
- **Fichier**: `interne/src/pages/Vehicules.jsx`
- **Lien du bouton**: `/dashboard/vehicules/nouveau` → `/dashboard/vehicules/ajouter`

#### Modifications VehiculeAdd.jsx
- **Fichier**: `interne/src/pages/VehiculeAdd.jsx` (maintenant utilisée pour l'édition simple)
- **Changement**: Ajout de `isPublic` au body du PUT

## Workflow utilisateur

### ➕ Créer un nouveau véhicule

1. Aller sur **"Véhicules"** dans le dashboard
2. Cliquer sur **"➕ Ajouter un véhicule"**
3. Remplir le formulaire complet :
   - Identité (parc, marque, modèle, etc.)
   - Description et historique
   - Caractéristiques techniques
   - Galerie de photos
4. **Avant de créer**, basculer le toggle **"🌐 Afficher sur le site public"**
   - ✅ ON = Visible sur le site public
   - 🔒 OFF = Visible uniquement par les administrateurs
5. Cliquer **"Créer le véhicule"**

### ✏️ Éditer un véhicule existant

1. Depuis la liste, cliquer **"Gérer"** sur un véhicule
2. Faire les modifications nécessaires
3. Dans la section **"🌐 Publication"**, vous pouvez :
   - Basculer le toggle pour changer la visibilité
   - Voir le statut en direct (✅ ou 🔒)
4. Cliquer **"💾 Enregistrer"**

## Données techniques

### Champ `isPublic`
- **Type**: `Boolean`
- **Valeur par défaut**: `false` (véhicule privé)
- **Stockage**: Base de données PostgreSQL Railway
- **Visibilité backend**: 
  - Inclus dans les réponses authentifiées (admins)
  - Filtré dans les réponses publiques

### Endpoints affectés

| Endpoint | Avant | Après |
|----------|-------|-------|
| `GET /vehicles` | Tous les véhicules | Même chose (API privée) |
| `PUT /vehicles/:parc` | N/A | Accepte `isPublic` |
| `POST /vehicles` | N/A | Accepte `isPublic` |
| `GET /public/vehicles` | **Tous les véhicules** | **Seulement `isPublic: true`** |
| `GET /public/vehicles/:parc` | **Tous les véhicules** | **Vérifie `isPublic: true`** |

## Tests recommandés

### ✅ Tests de création
```
1. Créer un véhicule avec isPublic: false
   → Ne doit PAS apparaître sur /public/vehicles

2. Créer un véhicule avec isPublic: true
   → Doit apparaître sur /public/vehicles

3. Modifier isPublic: false → true
   → Doit apparaître après sauvegarde

4. Modifier isPublic: true → false
   → Doit disparaître du site public
```

### ✅ Tests d'interface
```
1. Le toggle affiche le bon statut au chargement
2. Le message ✅/🔒 s'actualise au changement
3. La création redirige vers la page du véhicule
4. Les erreurs de création sont affichées correctement
```

## Exemple d'utilisation via API

### Créer un véhicule privé (par défaut)
```bash
curl -X POST https://api.rbe.fr/vehicles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parc": "921",
    "modele": "Mercedes-Benz Citaro",
    "marque": "Mercedes",
    "etat": "Disponible",
    "isPublic": false
  }'
```

### Publier un véhicule
```bash
curl -X PUT https://api.rbe.fr/vehicles/921 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isPublic": true }'
```

### Récupérer les véhicules publics (site externe)
```bash
curl https://api.rbe.fr/public/vehicles
# Retourne seulement les véhicules avec isPublic: true
```

## Architecture

```
├── Backend
│   ├── POST /vehicles               → Création avec isPublic
│   ├── PUT /vehicles/:parc         → Édition du isPublic
│   ├── GET /public/vehicles        → Filtré par isPublic
│   └── Prisma schema               → Nouveau champ Boolean
│
├── Frontend
│   ├── VehiculeCreate.jsx          → Page création neuve
│   ├── VehiculeShow.jsx            → Toggle isPublic
│   ├── Dashboard.jsx               → Route mise à jour
│   └── Vehicules.jsx               → Lien vers création
```

## Commit git

```
Commit: "✨ Ajouter fonction 'créer un véhicule' avec visibilité publique/privée"

- Ajout champ isPublic au modèle Vehicle (Prisma)
- Endpoints backend filtrés pour les véhicules publics
- Nouvelle page VehiculeCreate.jsx avec formulaire complet
- Toggle de publication dans VehiculeShow.jsx
- Routes et imports mis à jour
```

## Notes

- ✅ Tous les véhicules existants sont par défaut `isPublic: false`
- ✅ Le toggle est visible UNIQUEMENT pour les administrateurs authentifiés
- ✅ Les véhicules privés restent accessibles en édition administrative
- ✅ La galerie et les caractéristiques fonctionnent identiquement
- 🔒 La migration Prisma doit être exécutée une seule fois

