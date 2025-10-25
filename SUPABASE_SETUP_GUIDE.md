# Guide de Configuration Supabase - BOT PHARMA

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la configuration complète de Supabase pour le projet BOT PHARMA (Assistant WhatsApp Léa).

## 🎯 Objectifs

- Créer et configurer un projet Supabase
- Appliquer les migrations de base de données
- Configurer l'authentification
- Tester la connexion

## 📝 Prérequis

- Compte Supabase (gratuit) : https://supabase.com
- Supabase CLI installé (via npm)
- Variables d'environnement configurées

---

## Option 1 : Configuration Cloud (Production)

### Étape 1 : Créer un Projet Supabase

1. Allez sur https://supabase.com et connectez-vous
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name** : `bot-pharma-prod` (ou votre choix)
   - **Database Password** : Générez un mot de passe fort (SAUVEGARDEZ-LE !)
   - **Region** : `Europe (eu-west-1)` ou la plus proche de Libreville
   - **Pricing Plan** : Free (pour commencer)

4. Cliquez sur "Create new project" et attendez ~2 minutes

### Étape 2 : Récupérer les Clés API

1. Dans votre projet, allez dans **Settings** > **API**
2. Copiez les informations suivantes :

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 3 : Configurer les Variables d'Environnement

Ouvrez le fichier `.env` et remplacez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 4 : Lier le Projet Local

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Lier votre projet local au projet Supabase
npx supabase link --project-ref xxxxxxxxxxxxx

# Entrez votre mot de passe de base de données quand demandé
```

### Étape 5 : Appliquer les Migrations

```bash
# Pousser les migrations vers Supabase Cloud
npx supabase db push
```

Vous devriez voir :
```
✓ Applying migration 20240101000000_initial_schema.sql...
✓ Applying migration 20240101000001_rls_policies.sql...
✓ Applying migration 20240101000002_rgpd_functions.sql...
```

### Étape 6 : Vérifier la Base de Données

1. Allez dans **Database** > **Tables** dans le dashboard Supabase
2. Vous devriez voir toutes les tables :
   - users
   - products
   - conversations
   - messages
   - consent_logs
   - deletion_logs
   - orders
   - loyalty_coupons
   - campaign_messages
   - satisfaction_surveys
   - recommendations
   - advisor_alerts

---

## Option 2 : Configuration Locale (Développement)

### Étape 1 : Démarrer Supabase Local

```bash
# Démarrer Supabase en local (nécessite Docker)
npm run supabase:start
```

Attendez quelques minutes. Vous verrez :

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 2 : Configurer les Variables d'Environnement Locales

Mettez à jour votre `.env` avec les valeurs locales :

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 3 : Les Migrations sont Automatiques

Les migrations sont automatiquement appliquées au démarrage local !

### Étape 4 : Accéder au Studio

Ouvrez http://localhost:54323 pour accéder à Supabase Studio local.

---

## 🔐 Configuration de l'Authentification

### Étape 1 : Configurer les Providers

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Configurez les paramètres :
   - **Enable email confirmations** : ✓ (recommandé)
   - **Enable email change confirmations** : ✓
   - **Secure email change** : ✓

### Étape 2 : Configurer les URL de Redirection

1. Allez dans **Authentication** > **URL Configuration**
2. Ajoutez les URLs autorisées :

```
http://localhost:3000
http://localhost:3000/auth/callback
https://votre-domaine.com (pour la production)
https://votre-domaine.com/auth/callback
```

### Étape 3 : Créer un Utilisateur Admin

Exécutez cette requête SQL dans **SQL Editor** :

```sql
-- Créer un utilisateur admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@parapharmacie.com',
  crypt('VotreMotDePasseSecurise123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  ''
);

-- Créer l'entrée correspondante dans la table users
INSERT INTO users (phone_number, name, role)
VALUES ('+241-00-00-00-00', 'Administrateur', 'admin');
```

---

## ✅ Tests de Vérification

### Test 1 : Connexion à la Base de Données

Créez un fichier `test-supabase.js` :

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count');
    
    if (error) throw error;
    
    console.log('✓ Connexion Supabase réussie !');
    console.log('Nombre de produits :', data);
  } catch (error) {
    console.error('✗ Erreur de connexion :', error.message);
  }
}

testConnection();
```

Exécutez :
```bash
node test-supabase.js
```

### Test 2 : Vérifier les Politiques RLS

```sql
-- Dans SQL Editor, vérifiez que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Toutes les tables doivent avoir `rowsecurity = true`.

### Test 3 : Tester les Fonctions RGPD

```sql
-- Tester la fonction de consentement
SELECT check_user_consent('00000000-0000-0000-0000-000000000000');

-- Tester l'export de données
SELECT export_user_data('00000000-0000-0000-0000-000000000000');
```

---

## 🎨 Configuration Optionnelle

### Activer Realtime (pour le dashboard)

1. Allez dans **Database** > **Replication**
2. Activez la réplication pour les tables :
   - conversations
   - messages
   - advisor_alerts
   - orders

### Configurer le Stockage (pour les images produits)

1. Allez dans **Storage**
2. Créez un bucket `product-images`
3. Configurez les politiques :

```sql
-- Permettre la lecture publique
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Permettre l'upload pour les product editors
CREATE POLICY "Product editors can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.can_edit_products()
);
```

---

## 🚨 Dépannage

### Erreur : "relation does not exist"

Les migrations n'ont pas été appliquées. Exécutez :
```bash
npx supabase db push
```

### Erreur : "Invalid API key"

Vérifiez que vos clés dans `.env` correspondent à celles du dashboard Supabase.

### Erreur : "Row Level Security policy violation"

Les politiques RLS bloquent l'accès. Vérifiez que :
1. L'utilisateur est authentifié
2. L'utilisateur a le bon rôle
3. Les politiques sont correctement configurées

### Docker ne démarre pas (local)

```bash
# Arrêter tous les conteneurs
npm run supabase:stop

# Nettoyer
docker system prune -a

# Redémarrer
npm run supabase:start
```

---

## 📊 Prochaines Étapes

Une fois Supabase configuré :

1. ✅ Tester la connexion depuis l'application Next.js
2. ✅ Créer quelques produits de test
3. ✅ Tester le flow d'authentification
4. ✅ Configurer les autres services (OpenAI, Whapi)
5. ✅ Démarrer le serveur de développement

```bash
npm run dev
```

---

## 📞 Support

- Documentation Supabase : https://supabase.com/docs
- Discord Supabase : https://discord.supabase.com
- Documentation du projet : `/documentation`

---

**Dernière mise à jour** : Octobre 2025
**Statut** : Guide complet pour Phase 1
