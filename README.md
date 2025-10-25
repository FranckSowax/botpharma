# BOT PHARMA - WhatsApp Conversational Assistant

A WhatsApp conversational assistant ("Léa") for a parapharmacy in Libreville, Gabon. Léa welcomes customers automatically, asks targeted questions to understand their needs, recommends suitable products, and guides them through order placement.

## 🚀 Features

- **WhatsApp Integration**: Automated conversational flow in French via Whapi API
- **AI-Powered Recommendations**: GPT-4o for natural language understanding and personalized product suggestions
- **RGPD Compliance**: Consent capture, data deletion on request, audit logging
- **Admin Dashboard**: Next.js 14 web interface for product management, conversation monitoring, and KPI reporting
- **Post-Purchase Automation**: Satisfaction surveys, usage tips, and loyalty campaigns
- **Role-Based Access Control**: Admin, Product Editor, and Support roles

## 🛠️ Tech Stack

### Backend
- **Supabase**: PostgreSQL database, Authentication, Storage
- **Whapi API**: WhatsApp Business messaging
- **OpenAI GPT-4o**: Natural language processing and recommendations
- **Redis**: Message queue and caching

### Frontend
- **Next.js 14**: App Router, Server Components
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible React components
- **Recharts**: Data visualization

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- OpenAI API key
- Whapi API key
- Redis (optional, for production)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd "BOT PHARMA"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys and configuration.

4. **Initialize Supabase**
   ```bash
   npm run supabase:start
   ```

5. **Run database migrations**
   ```bash
   npx supabase db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
BOT PHARMA/
├── documentation/          # Project documentation
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Admin dashboard pages
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Feature components
│   ├── lib/               # Utilities and configurations
│   │   ├── supabase/      # Supabase client and helpers
│   │   ├── whapi/         # Whapi API client
│   │   ├── openai/        # OpenAI integration
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript type definitions
├── supabase/
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge Functions
├── public/                # Static assets
└── tests/                 # Test files

```

## 🗄️ Database Schema

The database includes the following main tables:
- `users`: Customer and admin user profiles
- `products`: Product catalog
- `conversations`: WhatsApp conversation sessions
- `messages`: Individual messages
- `consent_logs`: RGPD consent tracking
- `orders`: Order tracking
- `loyalty_coupons`: Loyalty program coupons
- `campaign_messages`: Automated follow-up messages

See `documentation/backend_structure_document.md` for detailed schema.

## 🔐 Security

- TLS/HTTPS encryption for all communications
- Row-Level Security (RLS) policies on all tables
- JWT-based authentication
- RGPD compliance with consent logging and data deletion
- Secure API key management via environment variables

## 📊 Dashboard Features

- **Product Management**: CRUD operations, CSV import/export
- **Conversation Monitoring**: Real-time message display, customer profiles
- **KPI Reporting**: Conversations, conversion rates, sales, satisfaction scores
- **RGPD Compliance**: Consent logs, data deletion interface
- **Role-Based Access**: Admin, Product Editor, Support roles

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Deployment

### Dashboard (Vercel)
```bash
vercel deploy
```

### Supabase
Deploy database migrations and Edge Functions via Supabase CLI:
```bash
npx supabase db push
npx supabase functions deploy
```

## 📖 Documentation

Detailed documentation is available in the `documentation/` folder:
- `project_requirements_document.md`: Project overview and requirements
- `tech_stack_document.md`: Technology choices explained
- `backend_structure_document.md`: Backend architecture and API design
- `frontend_guidelines_document.md`: Frontend architecture and styling
- `app_flow_document.md`: User flows and page transitions
- `security_guideline_document.md`: Implementation plan with security focus
- `tasks.json`: Detailed implementation tasks

## 🤝 Contributing

1. Review the documentation in the `documentation/` folder
2. Follow the coding standards (ESLint + Prettier)
3. Write tests for new features
4. Submit pull requests with clear descriptions

## 📝 License

Private project for Parapharmacie Libreville.

## 📧 Support

For questions or issues, contact the development team.
# botpharma
