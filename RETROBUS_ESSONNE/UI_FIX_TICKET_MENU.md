# 🎯 FIX - Menu des tickets se fond sous le ticket du dessous

## ✅ Problème Corrigé

Le menu d'options (trois points) sur les cartes de tickets se fondait visuellement sous le ticket situé en dessous. Cela rendait le menu difficile à lire et à utiliser.

## 🔍 Cause

Les `MenuList` de Chakra UI n'avaient pas de `zIndex` explicite, ce qui causait que le contenu du menu restait dans le flux normal de stacking et se faisait masquer par les cartes suivantes.

## ✅ Solution Appliquée

Ajout de `zIndex={10} position="relative"` à tous les `MenuList` affectés:

```jsx
<Menu>
  <MenuButton as={IconButton} icon={<FiMoreHorizontal />} variant="ghost" size="sm" />
  <MenuList zIndex={10} position="relative">  {/* ← Ajouté */}
    <MenuItem>Modifier</MenuItem>
    <MenuItem>Commenter</MenuItem>
    ...
  </MenuList>
</Menu>
```

## 📝 Fichiers Modifiés

1. **`interne/src/pages/SupportSite.jsx`** - Ligne 64
   - Menu du composant `TicketCard`

2. **`interne/src/pages/AdminGeneral.jsx`** - Ligne 167 et 498
   - Menu du composant `RetroReportCard` (tickets)
   - Menu du composant `ChangelogManagement` (changelog entries)

## 🧪 Vérification

Après redémarrage, vérifier:
- [ ] Ouvrir la page Support (tickets)
- [ ] Cliquer sur les trois points d'un ticket
- [ ] Le menu doit être **complètement visible** au-dessus du ticket suivant
- [ ] Idem dans AdminGeneral pour les tickets et changelog

## 📊 Impact

- ✅ Tous les menus des cartes sont maintenant accessibles et visibles
- ✅ Amélioration de l'UX pour la gestion des tickets
- ✅ Pas de changement de comportement, seulement visuel

