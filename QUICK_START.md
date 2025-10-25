# 🚀 Quick Start - BOT PHARMA

## ✅ Ce qui est déjà fait

- ✅ Structure du projet créée
- ✅ 856 packages npm installés
- ✅ Base de données conçue (12 tables)
- ✅ Migrations SQL prêtes
- ✅ Code backend et WhatsApp intégration
- ✅ Code IA (GPT-4o) pour recommandations
- ✅ Documentation complète

**Progression : ~60% du projet**

---

## 🎯 Ce qu'il reste à faire (3 étapes simples)

### Étape 1 : Configurer Supabase (15 min)

**Option A - Cloud (Recommandé)** :
1. Allez sur https://supabase.com
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Récupérez vos clés API (Settings > API)
5. Suivez le guide : `SUPABASE_SETUP_GUIDE.md`

**Option B - Local** :
```bash
npm run supabase:start
# Copiez les credentials affichés
```

### Étape 2 : Configurer les Variables d'Environnement (5 min)

Ouvrez le fichier `.env` et remplissez :

```env
# REQUIS - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# REQUIS - OpenAI (pour les recommandations IA)
OPENAI_API_KEY=sk-...

# REQUIS - Whapi (pour WhatsApp)
WHAPI_API_KEY=...
WHAPI_BASE_URL=https://gate.whapi.cloud

# OPTIONNEL - Le reste peut attendre
```

### Étape 3 : Appliquer les Migrations et Démarrer (2 min)

```bash
# 1. Appliquer les migrations
npx supabase db push

# 2. Tester la connexion
node scripts/test-supabase.js

# 3. Démarrer l'application
npm run dev
```

Ouvrez http://localhost:3000 🎉

---

## 📚 Documentation Utile

| Fichier | Quand l'utiliser |
|---------|------------------|
| `SUPABASE_SETUP_GUIDE.md` | Configuration Supabase détaillée |
| `PHASE_1_COMPLETE.md` | Vue d'ensemble de ce qui est fait |
| `SETUP_INSTRUCTIONS.md` | Instructions complètes |
| `PROJECT_STATUS.md` | État d'avancement du projet |
| `documentation/` | Spécifications techniques |

---

## 🆘 Besoin d'Aide ?

### Problème : "Cannot connect to Supabase"
➡️ Vérifiez vos clés dans `.env`
➡️ Exécutez `node scripts/test-supabase.js`

### Problème : "Table does not exist"
➡️ Exécutez `npx supabase db push`

### Problème : "OpenAI API error"
➡️ Vérifiez votre clé OpenAI dans `.env`
➡️ Vérifiez que vous avez des crédits

---

## 🎯 Après le Quick Start

Une fois l'application démarrée, vous pourrez :

1. **Tester l'assistant WhatsApp** (Léa)
2. **Accéder au dashboard** (en développement)
3. **Gérer les produits** via l'API
4. **Voir les conversations** dans Supabase

---

## 📞 Prochaines Phases

- **Phase 2** : Finaliser le Dashboard Next.js
- **Phase 3** : Post-Purchase Automation
- **Phase 4** : Tests et Déploiement

---

**Temps estimé total : ~25 minutes**

Bon développement ! 🚀
