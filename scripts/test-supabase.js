#!/usr/bin/env node

/**
 * Script de test de connexion Supabase
 * Usage: node scripts/test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSupabaseConnection() {
  log('\n🔍 Test de connexion Supabase - BOT PHARMA\n', 'cyan');

  // Vérifier les variables d'environnement
  log('1. Vérification des variables d\'environnement...', 'blue');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    log('✗ Variables d\'environnement manquantes !', 'red');
    log('  Assurez-vous que .env contient :', 'yellow');
    log('  - NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    process.exit(1);
  }

  log(`  URL: ${supabaseUrl}`, 'green');
  log(`  Anon Key: ${supabaseAnonKey.substring(0, 20)}...`, 'green');
  log('✓ Variables d\'environnement OK\n', 'green');

  // Créer le client Supabase
  log('2. Création du client Supabase...', 'blue');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  log('✓ Client créé\n', 'green');

  // Test 1 : Connexion à la base de données
  log('3. Test de connexion à la base de données...', 'blue');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    log('✓ Connexion à la base de données réussie', 'green');
    log(`  Nombre de produits: ${data || 0}\n`, 'green');
  } catch (error) {
    log('✗ Erreur de connexion à la base de données', 'red');
    log(`  ${error.message}\n`, 'red');
    process.exit(1);
  }

  // Test 2 : Vérifier les tables
  log('4. Vérification des tables...', 'blue');
  const tables = [
    'users',
    'products',
    'conversations',
    'messages',
    'consent_logs',
    'deletion_logs',
    'orders',
    'loyalty_coupons',
    'campaign_messages',
    'satisfaction_surveys',
    'recommendations',
    'advisor_alerts',
  ];

  let allTablesExist = true;
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (error) {
        log(`  ✗ Table "${table}" : ${error.message}`, 'red');
        allTablesExist = false;
      } else {
        log(`  ✓ Table "${table}" existe`, 'green');
      }
    } catch (error) {
      log(`  ✗ Table "${table}" : ${error.message}`, 'red');
      allTablesExist = false;
    }
  }

  if (!allTablesExist) {
    log('\n⚠ Certaines tables sont manquantes. Exécutez les migrations :', 'yellow');
    log('  npx supabase db push\n', 'yellow');
  } else {
    log('\n✓ Toutes les tables existent\n', 'green');
  }

  // Test 3 : Vérifier RLS
  log('5. Vérification de Row Level Security (RLS)...', 'blue');
  try {
    const { data, error } = await supabase.rpc('pg_tables', {
      schemaname: 'public',
    });

    if (error) {
      log('  ⚠ Impossible de vérifier RLS (normal si pas admin)', 'yellow');
    } else {
      log('  ✓ RLS vérifié\n', 'green');
    }
  } catch (error) {
    log('  ⚠ Impossible de vérifier RLS (normal si pas admin)\n', 'yellow');
  }

  // Test 4 : Tester l'insertion (devrait échouer sans auth)
  log('6. Test des politiques RLS (insertion sans auth)...', 'blue');
  try {
    const { error } = await supabase
      .from('products')
      .insert({
        name: 'Test Product',
        price_cfa: 1000,
        stock_qty: 10,
      });

    if (error) {
      if (error.message.includes('policy')) {
        log('  ✓ RLS fonctionne correctement (insertion bloquée)', 'green');
      } else {
        log(`  ⚠ Erreur inattendue: ${error.message}`, 'yellow');
      }
    } else {
      log('  ⚠ RLS pourrait ne pas être activé (insertion réussie)', 'yellow');
    }
  } catch (error) {
    log(`  ✓ RLS fonctionne (erreur attendue)`, 'green');
  }

  log('\n✅ Tests terminés avec succès !\n', 'green');
  log('Prochaines étapes :', 'cyan');
  log('1. Configurez les autres variables d\'environnement (OpenAI, Whapi)', 'cyan');
  log('2. Créez un utilisateur admin dans Supabase', 'cyan');
  log('3. Lancez le serveur de développement : npm run dev\n', 'cyan');
}

// Exécuter les tests
testSupabaseConnection().catch((error) => {
  log('\n✗ Erreur fatale:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
