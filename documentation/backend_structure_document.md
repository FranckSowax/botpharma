# Backend Structure Document

## 1. Backend Architecture

We’ve built the backend around Supabase, a serverless platform that gives us a managed PostgreSQL database, authentication, and storage in one place. We complement it with small custom functions for business logic and webhooks.

• Supabase as the central backend platform  
• Edge Functions (JavaScript/TypeScript) for custom workflows (e.g., WhatsApp webhook, AI recommendation logic)  
• External APIs integrated: Whapi for WhatsApp, OpenAI for GPT-4o, SendGrid (or SMTP) for email notifications, optional Slack API for team alerts

This architecture is:
- **Scalable**: Supabase auto-scales the database and functions as traffic grows.  
- **Maintainable**: Using managed services and serverless functions means less infrastructure to patch and maintain.  
- **Performant**: Edge Functions run close to users, and Supabase uses connection pooling to keep database queries fast.

## 2. Database Management

We use Supabase’s hosted PostgreSQL database for all structured data. Key points:

• Type: Relational (SQL) database (PostgreSQL)  
• Access: Through Supabase client libraries or Edge Functions, all using secure JWT tokens  
• Data practices:  
  – Row-Level Security (RLS) policies enforce which user roles can read or write each table  
  – Regular backups managed by Supabase  
  – Audit tables for GDPR consent and deletion logs  
  – Indexing on frequently queried columns (e.g., user_id, conversation_id, timestamps)

## 3. Database Schema

Below is a human-readable overview of our main tables, followed by SQL create statements.

### Tables Overview (Human-Readable)

1. **users**  
   Stores user profiles (customer and dashboard users).  
   Fields: id, phone_number, name, role (admin/product_editor/support), created_at

2. **consent_logs**  
   Records GDPR consent events.  
   Fields: id, user_id, consent_given (true/false), timestamp

3. **products**  
   Catalog of parapharmacy items.  
   Fields: id, name, description, category, price_cfa, stock_qty, image_url, ingredients, expiration_date, brand, barcode, tags, active

4. **conversations**  
   Tracks WhatsApp sessions.  
   Fields: id, user_id, started_at, ended_at, status (open/closed)

5. **messages**  
   Individual messages in a conversation.  
   Fields: id, conversation_id, sender (user/assistant/human), content, timestamp

6. **recommendations**  
   AI product suggestions per conversation.  
   Fields: id, conversation_id, product_id, recommended_at

7. **advisor_alerts**  
   Alerts when human intervention is needed.  
   Fields: id, conversation_id, reason, triggered_at, handled_by

8. **orders**  
   Outbound order links and status.  
   Fields: id, conversation_id, order_link, status, created_at, updated_at

9. **loyalty_coupons**  
   Coupons generated for loyalty campaigns.  
   Fields: id, user_id, code, discount_pct, valid_from, valid_to, used

10. **campaign_messages**  
    Scheduled or triggered follow-up messages.  
    Fields: id, user_id, type (survey/reactivation), sent_at, status

### SQL Schema (PostgreSQL)

```sql
-- 1. Users
eCREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','product_editor','support')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Consent Logs
CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_cfa INTEGER NOT NULL,
  stock_qty INTEGER NOT NULL,
  image_url TEXT,
  ingredients TEXT,
  expiration_date DATE,
  brand TEXT,
  barcode TEXT UNIQUE,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('open','closed'))
);

-- 5. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user','assistant','human')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  recommended_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Advisor Alerts
CREATE TABLE advisor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  handled_by UUID REFERENCES users(id)
);

-- 8. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  order_link TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Loyalty Coupons
CREATE TABLE loyalty_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  discount_pct INTEGER NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE
);

-- 10. Campaign Messages
CREATE TABLE campaign_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('survey','reactivation')),
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending','sent','failed'))
);
```

## 4. API Design and Endpoints

We follow a RESTful approach using Supabase Edge Functions and built-in REST endpoints.

### WhatsApp Webhook
• POST `/functions/whatsapp-webhook`  
  Receives incoming messages from Whapi, logs them, triggers AI logic or human alert.

### Conversation & Messaging
• GET `/rest/v1/conversations?user_id=...`  
  List a user’s conversations.  
• POST `/functions/start-conversation`  
  Creates a new conversation record.  
• POST `/functions/send-message`  
  Sends a WhatsApp message via Whapi, stores message in DB.

### Product Management
• GET `/rest/v1/products`  
  Public list or filtered by category/status.  
• POST `/rest/v1/products`  
  Create a new product (product_editor+).  
• PATCH `/rest/v1/products/:id`  
  Update product details.  
• DELETE `/rest/v1/products/:id`  
  Deactivate or remove a product.

### Recommendations & Loyalty
• POST `/functions/recommend-products`  
  Calls OpenAI, returns a list of product IDs.  
• POST `/functions/generate-coupon`  
  Creates a loyalty coupon based on AI scoring.  
• GET `/rest/v1/loyalty_coupons?user_id=...`  
  Fetch user’s coupons.

### Alerts & Orders
• POST `/functions/trigger-alert`  
  Logs an advisor alert and sends email/Slack.  
• POST `/functions/create-order-link`  
  Generates and stores an external cart link.

### Analytics
• GET `/functions/kpi-report`  
  Returns aggregated stats: total conversations, conversion rate, sales, satisfaction.

### GDPR & Consent
• POST `/rest/v1/consent_logs`  
  Log user consent or withdrawal.  
• DELETE `/functions/delete-user-data`  
  Purges user data on “SUPPRIMER” keyword, logs the deletion.

## 5. Hosting Solutions

We rely on managed, cloud-native services:

• Supabase (Database, Auth, Storage, Edge Functions)  
  – Hosted on AWS/GCP by Supabase  
  – SLA-backed uptime, automated scaling  
• External APIs: Whapi, OpenAI, SendGrid/SMTP, Slack  
  – Highly available endpoints  
  – Pay-as-you-go pricing keeps costs aligned with usage

This approach is cost-effective (no servers to manage), reliable (99.9%+ uptime), and scales seamlessly as user traffic grows.

## 6. Infrastructure Components

• **Load Balancer**: Handled by Supabase and external API providers—automatic traffic distribution  
• **Caching**:  
  – Postgres query caching built into Supabase  
  – Edge Function in-memory caching for AI prompt templates  
• **CDN**:  
  – Supabase Storage delivers product images via CDN  
  – Dashboard assets served by Vercel’s CDN (if hosting the admin UI there)

Together, these ensure fast response times and a smooth user experience.

## 7. Security Measures

• **Authentication**: Supabase Auth (email/password, magic link) issuing JWTs  
• **Authorization**: Row-Level Security (RLS) policies enforce role-based access per table  
• **Encryption**:  
  – TLS for all network traffic  
  – Data at rest encrypted by Supabase  
• **GDPR Compliance**:  
  – Explicit consent captured and timestamped  
  – Deletion flows via keyword “SUPPRIMER”  
  – Audit logs for consent and deletions retained  
• **Secrets Management**:  
  – Environment variables for API keys in Supabase Dashboard  
  – No secrets checked into source control

## 8. Monitoring and Maintenance

• **Monitoring**:  
  – Supabase Dashboard for database and function metrics  
  – Logflare or built-in Edge Function logs for errors and performance  
  – External uptime checks on key endpoints  
• **Alerts**:  
  – Slack or email notifications for function failures or high error rates  
• **Maintenance**:  
  – Automated backups by Supabase  
  – Scheduled dependency updates (npm packages for Edge Functions)  
  – Quarterly security audits and RLS policy reviews

## 9. Conclusion and Overall Backend Summary

Our backend is a fully managed, serverless solution built on Supabase. It ties together:  
• A PostgreSQL database with clear schemas for users, conversations, products, orders, and loyalty data  
• Edge Functions for custom flows (WhatsApp webhooks, AI calls, alerts)  
• Secure, role-based access and GDPR compliance at every step  
• Integration with best-in-class APIs (Whapi, OpenAI, SendGrid, Slack)  
• Built-in scaling, monitoring, and maintenance provided by cloud services

This setup meets the project goals of a responsive, reliable WhatsApp assistant (“Léa”), giving customers a personalized, GDPR-compliant journey from first message to loyalty, while keeping administration simple and secure.