-- Script d'initialisation de données de test pour BOT PHARMA
-- Exécutez ce script dans Supabase SQL Editor après avoir appliqué les migrations

-- ============================================
-- 1. CRÉER DES UTILISATEURS DE TEST
-- ============================================

-- Utilisateur Admin
INSERT INTO users (phone_number, name, role, profile_data)
VALUES 
  ('+241-00-00-00-01', 'Admin Principal', 'admin', '{"email": "admin@parapharmacie.com"}'),
  ('+241-00-00-00-02', 'Éditeur Produits', 'product_editor', '{"email": "editor@parapharmacie.com"}'),
  ('+241-00-00-00-03', 'Support Client', 'support', '{"email": "support@parapharmacie.com"}')
ON CONFLICT (phone_number) DO NOTHING;

-- Clients de test
INSERT INTO users (phone_number, name, role, profile_data)
VALUES 
  ('+241-11-11-11-11', 'Marie Dupont', 'customer', '{"preferences": {"bio": true, "vegan": false}}'),
  ('+241-22-22-22-22', 'Jean Martin', 'customer', '{"preferences": {"bio": false, "vegan": true}}'),
  ('+241-33-33-33-33', 'Sophie Bernard', 'customer', '{"preferences": {"fragrance_free": true}}')
ON CONFLICT (phone_number) DO NOTHING;

-- ============================================
-- 2. CRÉER DES PRODUITS DE TEST
-- ============================================

INSERT INTO products (name, description, category, price_cfa, stock_qty, brand, bio, vegan, fragrance_free, active, tags)
VALUES 
  -- Soins du visage
  (
    'Crème Hydratante Bio Aloe Vera',
    'Crème hydratante naturelle à base d''aloe vera biologique. Convient à tous types de peaux.',
    'Soins du visage',
    8500,
    45,
    'NaturaBio',
    true,
    true,
    true,
    true,
    ARRAY['hydratation', 'bio', 'vegan', 'aloe-vera']
  ),
  (
    'Sérum Anti-Âge Vitamine C',
    'Sérum concentré en vitamine C pour réduire les rides et illuminer le teint.',
    'Soins du visage',
    12000,
    30,
    'DermaLux',
    false,
    false,
    false,
    true,
    ARRAY['anti-age', 'vitamine-c', 'serum']
  ),
  (
    'Nettoyant Visage Doux Sans Parfum',
    'Gel nettoyant hypoallergénique sans parfum, idéal pour peaux sensibles.',
    'Soins du visage',
    6500,
    60,
    'SensitiveCare',
    false,
    true,
    true,
    true,
    ARRAY['nettoyant', 'sans-parfum', 'peau-sensible']
  ),
  
  -- Soins du corps
  (
    'Lait Corps Karité Bio',
    'Lait corporel enrichi au beurre de karité biologique. Nourrit et protège la peau.',
    'Soins du corps',
    9500,
    40,
    'AfricaNature',
    true,
    true,
    false,
    true,
    ARRAY['hydratation', 'karite', 'bio', 'corps']
  ),
  (
    'Huile de Massage Relaxante',
    'Huile de massage aux huiles essentielles de lavande et camomille.',
    'Soins du corps',
    11000,
    25,
    'ZenSpa',
    false,
    true,
    false,
    true,
    ARRAY['massage', 'relaxation', 'huiles-essentielles']
  ),
  
  -- Compléments alimentaires
  (
    'Vitamine D3 1000 UI',
    'Complément en vitamine D3 pour renforcer le système immunitaire. 60 gélules.',
    'Compléments alimentaires',
    7500,
    100,
    'VitaHealth',
    false,
    true,
    true,
    true,
    ARRAY['vitamines', 'immunite', 'vitamine-d']
  ),
  (
    'Oméga-3 Huile de Poisson',
    'Capsules d''oméga-3 pour la santé cardiovasculaire. 90 capsules.',
    'Compléments alimentaires',
    13500,
    50,
    'OceanLife',
    false,
    false,
    true,
    true,
    ARRAY['omega-3', 'coeur', 'poisson']
  ),
  (
    'Probiotiques Bio 10 Milliards',
    'Probiotiques biologiques pour la santé digestive. 30 gélules.',
    'Compléments alimentaires',
    15000,
    35,
    'BioDigest',
    true,
    true,
    true,
    true,
    ARRAY['probiotiques', 'bio', 'digestion']
  ),
  
  -- Hygiène
  (
    'Dentifrice Blancheur Naturel',
    'Dentifrice naturel au charbon actif pour des dents blanches.',
    'Hygiène',
    4500,
    80,
    'SmileBright',
    true,
    true,
    false,
    true,
    ARRAY['dentifrice', 'blancheur', 'charbon']
  ),
  (
    'Déodorant Sans Aluminium',
    'Déodorant naturel sans aluminium ni parabènes. Efficacité 24h.',
    'Hygiène',
    5500,
    70,
    'FreshNature',
    true,
    true,
    true,
    true,
    ARRAY['deodorant', 'sans-aluminium', 'naturel']
  ),
  
  -- Bébé
  (
    'Crème Change Bébé Bio',
    'Crème protectrice pour le change, certifiée bio et hypoallergénique.',
    'Bébé',
    8000,
    55,
    'BabyNature',
    true,
    true,
    true,
    true,
    ARRAY['bebe', 'change', 'bio', 'hypoallergenique']
  ),
  (
    'Lingettes Bébé Sans Parfum',
    'Lingettes douces sans parfum ni alcool. Pack de 72 lingettes.',
    'Bébé',
    3500,
    90,
    'BabyCare',
    false,
    true,
    true,
    true,
    ARRAY['bebe', 'lingettes', 'sans-parfum']
  ),
  
  -- Cheveux
  (
    'Shampoing Cheveux Secs Argan',
    'Shampoing nourrissant à l''huile d''argan pour cheveux secs et abîmés.',
    'Cheveux',
    7000,
    45,
    'HairLuxe',
    false,
    false,
    false,
    true,
    ARRAY['shampoing', 'argan', 'cheveux-secs']
  ),
  (
    'Masque Capillaire Réparateur',
    'Masque intensif pour réparer les cheveux abîmés. Résultat visible dès la 1ère application.',
    'Cheveux',
    10500,
    30,
    'RepairPro',
    false,
    true,
    false,
    true,
    ARRAY['masque', 'reparation', 'cheveux']
  ),
  
  -- Minceur
  (
    'Thé Vert Détox Bio',
    'Infusion de thé vert biologique pour favoriser l''élimination. Boîte de 20 sachets.',
    'Minceur',
    6000,
    40,
    'SlimTea',
    true,
    true,
    true,
    true,
    ARRAY['the-vert', 'detox', 'bio', 'minceur']
  )
ON CONFLICT (barcode) DO NOTHING;

-- ============================================
-- 3. CRÉER DES LOGS DE CONSENTEMENT
-- ============================================

INSERT INTO consent_logs (user_id, consent_given)
SELECT id, true
FROM users
WHERE role = 'customer';

-- ============================================
-- 4. CRÉER DES CONVERSATIONS DE TEST
-- ============================================

-- Conversation 1 : Terminée avec succès
WITH customer1 AS (
  SELECT id FROM users WHERE phone_number = '+241-11-11-11-11' LIMIT 1
),
conv1 AS (
  INSERT INTO conversations (user_id, status, current_state, started_at, ended_at)
  SELECT id, 'closed', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
  FROM customer1
  RETURNING id
)
INSERT INTO messages (conversation_id, sender, content, timestamp)
SELECT 
  conv1.id,
  sender,
  content,
  NOW() - INTERVAL '2 days' + (row_number() OVER () || ' minutes')::INTERVAL
FROM conv1, (VALUES
  ('user', 'Bonjour'),
  ('assistant', 'Bonjour ! Je suis Léa, votre assistante virtuelle de la Parapharmacie Libreville. Comment puis-je vous aider aujourd''hui ?'),
  ('user', 'Je cherche une crème hydratante bio'),
  ('assistant', 'Excellente idée ! J''ai plusieurs crèmes hydratantes biologiques. Avez-vous une préférence pour une marque ou un ingrédient spécifique ?'),
  ('user', 'Aloe vera si possible'),
  ('assistant', 'Parfait ! Je vous recommande notre Crème Hydratante Bio Aloe Vera de NaturaBio à 8 500 FCFA. Elle convient à tous types de peaux.')
) AS msgs(sender, content);

-- Conversation 2 : En cours avec escalade
WITH customer2 AS (
  SELECT id FROM users WHERE phone_number = '+241-22-22-22-22' LIMIT 1
),
conv2 AS (
  INSERT INTO conversations (user_id, status, current_state, started_at)
  SELECT id, 'escalated', 'human_handoff', NOW() - INTERVAL '1 hour'
  FROM customer2
  RETURNING id
)
INSERT INTO messages (conversation_id, sender, content, timestamp)
SELECT 
  conv2.id,
  sender,
  content,
  NOW() - INTERVAL '1 hour' + (row_number() OVER () || ' minutes')::INTERVAL
FROM conv2, (VALUES
  ('user', 'Bonjour, j''ai besoin de conseils'),
  ('assistant', 'Bonjour ! Je suis ravie de vous aider. De quels conseils avez-vous besoin ?'),
  ('user', 'Je voudrais parler à un conseiller'),
  ('assistant', 'Je comprends. Je vais vous mettre en relation avec un de nos conseillers. Un instant s''il vous plaît.')
) AS msgs(sender, content);

-- Créer une alerte pour la conversation 2
INSERT INTO advisor_alerts (conversation_id, reason, status)
SELECT id, 'Client demande un conseiller humain', 'pending'
FROM conversations
WHERE current_state = 'human_handoff'
LIMIT 1;

-- ============================================
-- 5. CRÉER DES COMMANDES DE TEST
-- ============================================

-- Commande pour la conversation 1
INSERT INTO orders (conversation_id, user_id, order_link, external_order_id, total_amount, status)
SELECT 
  c.id,
  c.user_id,
  'https://ecommerce.parapharmacie.com/cart/abc123',
  'ORDER-2024-001',
  8500,
  'completed'
FROM conversations c
WHERE c.status = 'closed'
LIMIT 1;

-- ============================================
-- 6. CRÉER DES COUPONS DE FIDÉLITÉ
-- ============================================

INSERT INTO loyalty_coupons (user_id, code, discount_pct, valid_from, valid_to)
SELECT 
  id,
  'WELCOME' || SUBSTRING(phone_number FROM 10),
  10,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
FROM users
WHERE role = 'customer';

-- ============================================
-- 7. CRÉER UNE ENQUÊTE DE SATISFACTION
-- ============================================

INSERT INTO satisfaction_surveys (user_id, order_id, rating, feedback, submitted_at)
SELECT 
  o.user_id,
  o.id,
  5,
  'Excellent service ! Léa m''a très bien conseillée.',
  NOW() - INTERVAL '1 day'
FROM orders o
WHERE o.status = 'completed'
LIMIT 1;

-- ============================================
-- VÉRIFICATION DES DONNÉES
-- ============================================

-- Afficher un résumé
SELECT 
  'Utilisateurs' AS table_name,
  COUNT(*) AS count
FROM users
UNION ALL
SELECT 'Produits', COUNT(*) FROM products
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Commandes', COUNT(*) FROM orders
UNION ALL
SELECT 'Coupons', COUNT(*) FROM loyalty_coupons
UNION ALL
SELECT 'Enquêtes', COUNT(*) FROM satisfaction_surveys
UNION ALL
SELECT 'Alertes', COUNT(*) FROM advisor_alerts;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✓ Base de données initialisée avec succès !';
  RAISE NOTICE '  - Utilisateurs créés (admin, éditeur, support, clients)';
  RAISE NOTICE '  - 15 produits ajoutés dans différentes catégories';
  RAISE NOTICE '  - Conversations de test créées';
  RAISE NOTICE '  - Commandes et coupons générés';
  RAISE NOTICE '';
  RAISE NOTICE 'Vous pouvez maintenant tester l''application !';
END $$;
