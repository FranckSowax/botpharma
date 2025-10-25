# Tech Stack Document

Ce document explique, en termes simples, les choix technologiques retenus pour créer un assistant conversationnel WhatsApp pour une parapharmacie. Vous verrez comment chaque outil ou service contribue à offrir une expérience client fluide, personnalisée et sécurisée.

## 1. Frontend Technologies

Le frontend correspond à l’interface d’administration (le dashboard) que vos équipes utiliseront pour gérer les produits et suivre les interactions.

- **Next.js 14**  
  Un framework web moderne qui permet de créer des pages très réactives et rapides. Il gère automatiquement la construction et le chargement optimisé de vos pages.
- **TypeScript**  
  Une version de JavaScript qui ajoute des « types » pour éviter les erreurs de programmation. Cela rend le code plus fiable et plus facile à maintenir.
- **Tailwind CSS**  
  Un outil de styles (couleurs, espacements, polices) prêt à l’emploi. Il permet de construire une interface propre, cohérente et rapide à développer.
- **shadcn UI**  
  Une bibliothèque de composants d’interface (boutons, formulaires, tableaux…) déjà stylés avec Tailwind. Cela accélère la création d’un design professionnel et accessible.

Ces technologies garantissent que votre dashboard :
- S’affiche rapidement même avec une connexion internet moyenne
- Reste cohérent avec votre charte graphique (vert doux, blanc, gris clair, police Inter/Roboto)
- Est modulable, pour ajouter facilement de nouvelles pages ou fonctionnalités

## 2. Backend Technologies

Le backend gère la logique métier, les données et la communication entre WhatsApp, l’IA et votre base de produits.

- **Supabase**  
  Une plateforme cloud qui inclut :
  - **Base de données PostgreSQL** : stocke les produits, les clients, l’historique des conversations, les consentements RGPD, etc.
  - **Authentification (Auth)** : gère les comptes utilisateurs et les rôles (administrateur, éditeur de produits, support client).
  - **Stockage (Storage)** : conserve les images produits et autres fichiers.
- **API Whapi**  
  Service spécialisé pour envoyer et recevoir des messages WhatsApp sans développer votre propre solution. Il relaie les messages entre WhatsApp et votre backend.
- **GPT-4o (via l’API OpenAI)**  
  Intelligence artificielle pour :
  - Comprendre les besoins clients en langage naturel
  - Générer des réponses et recommandations de produits personnalisées
  - Enrichir les profils clients (données comportementales, scoring)

Ensemble, ces composants :
- Échangent les informations en temps réel
- Garantissent que chaque message WhatsApp déclenche la bonne action (recommandation, redirection vers un conseiller humain, envoi de coupon…)
- Conservent toutes les données nécessaires pour analyser et améliorer l’expérience client

## 3. Infrastructure et Déploiement

Pour que tout fonctionne de manière fiable, nous avons mis en place ces éléments :

- **Version Control (Git / GitHub)**  
  Suivi de chaque modification du code. Les équipes peuvent collaborer sans écraser le travail des autres.
- **CI/CD (GitHub Actions)**  
  Processus automatisé qui teste et déploie le code dès qu’une mise à jour est validée. Cela réduit les risques d’erreur et accélère la mise en production.
- **Hébergement du dashboard (Vercel)**  
  Solution cloud optimisée pour Next.js, qui assure un chargement rapide et une montée en charge automatique selon le trafic.
- **Hébergement de la base et du backend (Supabase cloud)**  
  Scalabilité automatique, sauvegardes régulières et haute disponibilité.
- **Alertes et notifications**  
  - **Email (SendGrid ou équivalent)** : pour prévenir l’équipe en cas de panier élevé ou de demande d’assistance humaine
  - **Slack** : intégration pour recevoir en temps réel les alertes critiques et assigner des tickets

Ces choix offrent :
- Fiabilité (redondance, sauvegardes)
- Facilité de maintenance (déploiement automatisé)
- Capacité à monter en charge (plusieurs milliers de conversations simultanées)

## 4. Third-Party Integrations

Nous nous appuyons sur des services externes pour enrichir les fonctionnalités sans tout développer en interne :

- **Whapi API** : envoi et réception de messages WhatsApp
- **OpenAI GPT-4o** : IA pour le traitement du langage et les recommandations
- **SendGrid (ou similaire)** : envoi d’emails d’alerte et de notifications
- **Slack** : réception d’alertes en interne pour les conseillers humains
- **Plateforme e-commerce externe** : lien de redirection vers votre site pour le paiement (carte bancaire, PayPal)

Ces intégrations permettent de :
- Délivrer une expérience utilisateur riche sans lourdeur technique
- Bénéficier de la fiabilité des plateformes établies
- Conserver la flexibilité pour évoluer ou remplacer un service si nécessaire

## 5. Security and Performance Considerations

Sécurité et rapidité sont essentielles, surtout dans le domaine santé/bien-être.

Sécurité :
- **Authentification et rôles** via Supabase Auth (contrôle d’accès granulaires)
- **RGPD** : consentement explicite au premier message, stockage horodaté, suppression sur demande via mot-clé « SUPPRIMER »
- **Chiffrement** des données en transit (HTTPS/TLS) et au repos (base de données chiffrée)
- **Journalisation** des actions critiques (connexion, suppression de données) pour audit

Performance :
- **Cache au niveau edge** (via Vercel) pour servir rapidement les pages du dashboard
- **Indexation de la base** (PostgreSQL) sur les colonnes fréquemment interrogées (produit, client)
- **Pool de connexions** à la base Supabase pour gérer efficacement plusieurs requêtes simultanées
- **Limitation de débit (rate limiting)** sur l’API Whapi pour éviter les abus et garantir un service stable

## 6. Conclusion et Récapitulatif Global

Nous avons choisi une architecture moderne, modulaire et évolutive pour :

- Offrir un assistant WhatsApp personnalisé et rapide, guidé par l’IA (GPT-4o)
- Assurer une gestion simple et sécurisée des produits et des conversations via un dashboard Next.js + Supabase
- Garantir la conformité RGPD et la protection des données clients
- Faciliter le déploiement continu et la montée en charge grâce à GitHub, Vercel et Supabase cloud
- Intégrer des services tiers réputés (Whapi, SendGrid, Slack) pour enrichir l’expérience sans complexité interne

Points forts :
- Expérience utilisateur fluide, à la fois sur WhatsApp et dans le backoffice
- Personnalisation avancée grâce à l’IA
- Sécurité et conformité assurées
- Architecture prête pour évoluer (multilingue, nouveaux canaux, modules d’analyse avancée)

Ce choix de technologies vous permettra de lancer rapidement votre assistant WhatsApp tout en conservant la souplesse nécessaire pour grandir et innover.