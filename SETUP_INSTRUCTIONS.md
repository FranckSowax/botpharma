# Setup Instructions for BOT PHARMA

## Prerequisites

Before starting, ensure you have:
- Node.js >= 18.0.0
- npm >= 9.0.0
- A Supabase account
- OpenAI API key
- Whapi API key

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Supabase client
- OpenAI SDK
- Axios for HTTP requests
- Tailwind CSS and shadcn/ui components
- And all other dependencies

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Whapi Configuration
WHAPI_API_KEY=your-whapi-api-key
WHAPI_BASE_URL=https://gate.whapi.cloud
WHAPI_WEBHOOK_SECRET=your-webhook-secret

# SendGrid Configuration (optional)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=notifications@yourparapharmacy.com

# Redis Configuration (optional, for production)
REDIS_URL=redis://localhost:6379

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# E-commerce Integration
ECOMMERCE_WEBHOOK_SECRET=your-ecommerce-webhook-secret
ECOMMERCE_CART_BASE_URL=https://your-ecommerce-site.com/cart

# Brand Configuration
BRAND_NAME=Parapharmacie Libreville
BRAND_PHONE=+241-XX-XX-XX-XX
BRAND_PRIMARY_COLOR=#3BA55C
```

## Step 3: Set Up Supabase

### Option A: Using Supabase Cloud

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and keys from Project Settings > API
3. Run the migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations to Supabase
npx supabase db push
```

### Option B: Using Local Supabase (Development)

```bash
# Start local Supabase
npm run supabase:start

# This will output your local credentials
# Update your .env file with these local values
```

## Step 4: Initialize the Database

The migrations will create:
- All required tables (users, products, conversations, etc.)
- Row Level Security (RLS) policies
- RGPD compliance functions
- Indexes for performance

## Step 5: Create an Admin User

After running migrations, create your first admin user:

```sql
-- Run this in Supabase SQL Editor
INSERT INTO users (phone_number, name, role)
VALUES ('+241-XX-XX-XX-XX', 'Admin User', 'admin');
```

## Step 6: Set Up Whapi Webhook

1. Log in to your Whapi dashboard
2. Go to Webhooks settings
3. Add a new webhook with URL: `https://your-domain.com/api/whatsapp/webhook`
4. Save the webhook secret to your `.env` file

## Step 7: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 8: Test the Setup

### Test WhatsApp Integration

1. Send a message to your WhatsApp Business number
2. You should receive an automated greeting from Léa
3. Follow the consent flow
4. Try asking for product recommendations

### Test the Dashboard

1. Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. You should see the admin interface (authentication will be added in next steps)

## Next Steps

### Implement Additional Features

1. **Dashboard Authentication**
   - Set up Supabase Auth for dashboard users
   - Implement login/logout flows
   - Add role-based access control

2. **Product Management**
   - Create product CRUD interface
   - Implement CSV import/export
   - Add product image upload

3. **Conversation Monitoring**
   - Build real-time conversation viewer
   - Add customer profile pages
   - Implement escalation alerts

4. **KPI Reporting**
   - Create analytics dashboard
   - Add charts and visualizations
   - Implement date range filters

5. **Post-Purchase Automation**
   - Set up satisfaction surveys
   - Implement loyalty campaigns
   - Add usage tips delivery

## Troubleshooting

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Supabase Connection Issues

- Verify your Supabase URL and keys in `.env`
- Check if your Supabase project is active
- Ensure RLS policies are correctly set up

### Whapi Webhook Not Working

- Verify webhook URL is publicly accessible
- Check webhook secret matches your `.env` file
- Review Whapi webhook logs for errors

### OpenAI API Errors

- Verify your API key is valid
- Check your OpenAI account has credits
- Review rate limits and quotas

## Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

### Environment Variables in Production

Make sure to set all environment variables in your Vercel project settings.

### Database Migrations in Production

```bash
# Push migrations to production Supabase
npx supabase db push --db-url your-production-db-url
```

## Support

For issues or questions:
1. Check the documentation in the `documentation/` folder
2. Review the tasks.json file for implementation details
3. Contact the development team

## Security Checklist

Before going to production:
- [ ] All environment variables are set correctly
- [ ] Supabase RLS policies are enabled
- [ ] Webhook signatures are verified
- [ ] API keys are not exposed in client-side code
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Error messages don't leak sensitive information
- [ ] RGPD compliance is tested
- [ ] Backup strategy is in place
