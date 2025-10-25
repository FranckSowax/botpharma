# Project Requirements Document (PRD)

## 1. Project Overview

We are building a WhatsApp conversational assistant (“Léa”) for a parapharmacy in Libreville, Gabon. Léa will welcome customers automatically, ask targeted questions to understand their needs, recommend suitable products, and guide them through order placement. After purchase, Léa will follow up with satisfaction surveys, usage tips, and loyalty offers. All interactions happen over WhatsApp Business, while product and customer data live in Supabase. The WhatsApp API (Whapi) handles message exchange, and GPT-4o may power natural-language understanding and personalized recommendations.

This assistant aims to streamline the customer journey: from discovery and advice to conversion and retention. Key success criteria include high user engagement on WhatsApp, accurate product recommendations, smooth handoff to human advisors when needed, and measurable improvements in conversion and repeat purchases. A web-based dashboard will let administrators import or edit products, monitor conversations, view KPIs (conversations, conversions, sales, satisfaction), and manage RGPD consent.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)

*   WhatsApp conversational flow in French
*   Automatic greeting, RGPD consent capture, targeted Q&A menus
*   Product recommendation with images, price, availability
*   Redirection to human advisor (triggered by keywords or high cart value)
*   Delivery of links to external e-commerce cart for order placement
*   Post-purchase follow-up messages (satisfaction survey, usage tips)
*   Automated loyalty messages/coupons
*   Supabase backend:\
    • Products table (import via CSV or form)\
    • Customers table enriched by AI (profile, history, satisfaction)\
    • Consent and deletion logs
*   Web dashboard (Next.js 14, TypeScript, Tailwind CSS, shadcn UI):\
    • Role-based access (Admin, Product Editor, Support)\
    • Product management (CRUD, CSV import)\
    • Conversation and KPI reporting (conversations, conversion rate, sales, satisfaction)\
    • RGPD compliance module
*   Integration with Whapi API for sending/receiving WhatsApp messages

### Out-of-Scope (Phase 2 or Later)

*   Multilingual support (English, others)
*   Direct payment processing inside WhatsApp
*   Advanced analytics modules (predictive sales forecasting)
*   In-depth satisfaction sentiment analysis beyond basic ratings
*   Offline messaging or SMS fallback
*   Mobile-native admin app

## 3. User Flow

A customer sends any message to the parapharmacy’s WhatsApp number. Léa replies immediately with a branded welcome message and asks for consent to process data (RGPD). Once consent is recorded, Léa displays quick-reply buttons:

1.  “🧴 I’m looking for a product”
2.  “💊 I need health advice”
3.  “🎁 Show me promotions”

After selection, Léa asks 2–3 targeted questions (e.g., product category, brand preference, bio/vegan). Responses update the customer’s profile in Supabase. Léa uses GPT-4o (optional) to refine understanding and generate a shortlist of products. Each recommended item is sent with image, price, availability, and a “View in cart” link.

If the customer requests a human advisor (keywords like “talk to advisor”) or their implied cart value exceeds 150 000 FCFA, an alert is sent by email and shown in the dashboard. Otherwise, the customer clicks the link to finalize their order on the external e-commerce site (card/PayPal). Once payment is confirmed, the backend records the sale and Léa sends an order confirmation with tracking info.

Two days after delivery, Léa initiates a satisfaction survey. The customer rates the experience and can ask follow-up questions. Based on their profile and purchase history, Léa periodically sends personalized coupons or cross-sell offers to drive loyalty.

## 4. Core Features

*   **Automated Greeting & Consent**\
    • Welcome message with brand tone\
    • Explicit RGPD consent capture and timestamp
*   **Needs Identification**\
    • Quick-reply menus for main choices\
    • Follow-up questions for product details (bio, vegan, fragrance-free)
*   **AI-Powered Recommendations**\
    • GPT-4o analyzes answers and customer profile\
    • Sends product cards with image, price, availability
*   **Human Escalation**\
    • Detect keywords or high cart value\
    • Trigger alerts (email & dashboard)
*   **Order Finalization**\
    • Send personalized link to external cart\
    • Confirm order and send tracking info
*   **Post-Purchase Follow-Up**\
    • Satisfaction survey message\
    • Usage tips and Q&A
*   **Automated Loyalty Campaigns**\
    • Custom coupons based on AI scoring\
    • Scheduled reactivation messages
*   **Dashboard Administration**\
    • Role-based access control (Admin, Editor, Support)\
    • Product CRUD and CSV import/export\
    • RGPD compliance (consent logs, deletion keyword)\
    • KPI reporting (conversations, conversion rate, sales, satisfaction)

## 5. Tech Stack & Tools

*   **Backend & Database**:\
    • Supabase – PostgreSQL database, Auth, Storage
*   **Web Dashboard**:\
    • Next.js 14 (App Router)\
    • TypeScript\
    • Tailwind CSS + shadcn UI components
*   **WhatsApp Integration**:\
    • Whapi API – send/receive template & interactive messages
*   **AI & Automation**:\
    • GPT-4o – natural language understanding, recommendation generation\
    • Supabase Edge Functions or Serverless for orchestration
*   **Notifications & Alerts**:\
    • Email via SendGrid or SMTP\
    • Optional Slack integration for real-time alerts
*   **IDE / Dev Tools**:\
    • VS Code with ESLint, Prettier, Tailwind IntelliSense

## 6. Non-Functional Requirements

*   **Performance**:\
    • Average bot response < 500 ms\
    • Dashboard page load ≤ 1.5 s\
    • Support 200 concurrent WhatsApp sessions
*   **Security & Compliance**:\
    • Data at rest encrypted (PGP or Supabase defaults)\
    • Communication over HTTPS / TLS 1.2+\
    • RGPD compliance: consent logs, on-demand deletion
*   **Scalability**:\
    • Auto-scale Supabase Edge Functions or serverless\
    • Caching of frequent product lists in memory
*   **Usability**:\
    • Mobile-first dashboard design\
    • Clear error messaging and form validation

## 7. Constraints & Assumptions

*   **Constraints**:\
    • Availability of GPT-4o API\
    • Whapi API rate limits (e.g., 1 000 messages/min)\
    • Internet connectivity for customers in Libreville
*   **Assumptions**:\
    • Parapharmacy brand colors are green (#A3D9A5), white, gray\
    • Customers speak French only (Phase 1)\
    • External e-commerce platform handles payments securely\
    • Unique product identifiers exist (barcodes or references)

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits**\
    • Risk: Hitting WhatsApp or GPT-4o limits during promotions\
    • Mitigation: Implement message queuing and back-off retries
*   **Data Quality**\
    • Risk: Incomplete product data in CSV imports\
    • Mitigation: Strict CSV schema validation and manual review
*   **Conversation Ambiguity**\
    • Risk: GPT-4o misinterprets open-ended user input\
    • Mitigation: Restrict inputs to quick-reply buttons where possible
*   **RGPD Deletion**\
    • Risk: Partial data remains after “SUPPRIMER” keyword\
    • Mitigation: Automated deletion script that cascades across tables
*   **Dashboard Access**\
    • Risk: Role misconfiguration granting excessive rights\
    • Mitigation: Enforce least-privilege by default; audit user roles

This PRD provides a clear blueprint for building the WhatsApp assistant, the supporting dashboard, data models, and integrations. All core requirements and constraints are laid out to guide subsequent technical documents (Tech Stack, Frontend Guidelines, Backend Structure, etc.) without ambiguity.
