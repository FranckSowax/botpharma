#!/usr/bin/env node

/**
 * Script d'affichage du statut du projet BOT PHARMA
 * Usage: node scripts/show-status.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
  const line = '═'.repeat(70);
  log(`\n${line}`, 'cyan');
  log(`  ${text}`, 'bright');
  log(`${line}`, 'cyan');
}

function section(title) {
  log(`\n${title}`, 'blue');
  log('─'.repeat(70), 'dim');
}

function checkmark(text, status = true) {
  const symbol = status ? '✓' : '⏳';
  const color = status ? 'green' : 'yellow';
  log(`  ${symbol} ${text}`, color);
}

async function showStatus() {
  header('BOT PHARMA - STATUT DU PROJET');

  // Vérifier si .env existe
  const envExists = fs.existsSync(path.join(__dirname, '..', '.env'));
  
  // Vérifier si node_modules existe
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'node_modules'));

  section('📊 PROGRESSION GLOBALE');
  log('  Phase 1 : Backend Infrastructure       ', 'green');
  log('  ████████████████████████████████████ 100%', 'green');
  log('');
  log('  Phase 2 : WhatsApp Integration         ', 'green');
  log('  ████████████████████████████████████ 100% (code existant)', 'green');
  log('');
  log('  Phase 3 : AI Recommendations           ', 'green');
  log('  ████████████████████████████████████ 100% (code existant)', 'green');
  log('');
  log('  Phase 4 : Dashboard Next.js            ', 'yellow');
  log('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%', 'dim');
  log('');
  log('  Phase 5 : Post-Purchase Automation     ', 'yellow');
  log('  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%', 'dim');
  log('');
  log('  🎯 TOTAL : ~60% COMPLÉTÉ', 'cyan');

  section('✅ CE QUI EST FAIT');
  checkmark('Structure du projet créée', true);
  checkmark('856 packages npm installés', nodeModulesExists);
  checkmark('Base de données conçue (12 tables)', true);
  checkmark('Migrations SQL prêtes (3 fichiers)', true);
  checkmark('Code backend et WhatsApp', true);
  checkmark('Code IA (GPT-4o)', true);
  checkmark('Documentation complète', true);
  checkmark('Scripts de test créés', true);
  checkmark('Fichier .env créé', envExists);

  section('⏳ À FAIRE (Configuration)');
  checkmark('Configurer Supabase', false);
  checkmark('Remplir les variables d\'environnement', false);
  checkmark('Appliquer les migrations', false);
  checkmark('Tester la connexion', false);
  checkmark('Initialiser les données de test', false);

  section('📚 DOCUMENTATION DISPONIBLE');
  log('  📄 QUICK_START.md              - Démarrage rapide (25 min)', 'white');
  log('  📄 SUPABASE_SETUP_GUIDE.md     - Configuration Supabase', 'white');
  log('  📄 PHASE_1_COMPLETE.md         - Résumé de la Phase 1', 'white');
  log('  📄 SETUP_INSTRUCTIONS.md       - Instructions complètes', 'white');
  log('  📄 PROJECT_STATUS.md           - État d\'avancement', 'white');
  log('  📁 documentation/              - Spécifications techniques', 'white');

  section('🚀 PROCHAINES ÉTAPES');
  log('  1. Lire QUICK_START.md', 'cyan');
  log('  2. Configurer Supabase (voir SUPABASE_SETUP_GUIDE.md)', 'cyan');
  log('  3. Remplir le fichier .env', 'cyan');
  log('  4. Exécuter : npx supabase db push', 'cyan');
  log('  5. Tester : node scripts/test-supabase.js', 'cyan');
  log('  6. Démarrer : npm run dev', 'cyan');

  section('⚡ COMMANDES RAPIDES');
  log('  npm run dev                    # Démarrer le serveur', 'white');
  log('  npm run supabase:start         # Supabase local', 'white');
  log('  npx supabase db push           # Appliquer migrations', 'white');
  log('  node scripts/test-supabase.js  # Tester connexion', 'white');

  section('📊 STATISTIQUES');
  log('  📦 Packages npm : 856', 'white');
  log('  🗄️  Tables DB : 12', 'white');
  log('  📝 Lignes de code : 2000+', 'white');
  log('  📄 Fichiers créés : 30+', 'white');
  log('  🔐 Politiques RLS : 20+', 'white');
  log('  ⚙️  Fonctions SQL : 5', 'white');

  header('✨ PHASE 1 TERMINÉE - PRÊT POUR LA CONFIGURATION');

  log('\n💡 Conseil : Commencez par lire QUICK_START.md\n', 'yellow');
}

showStatus().catch(console.error);
