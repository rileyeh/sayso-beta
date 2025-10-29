# SaySo Setup Guide

## 1. Supabase Setup

### Create Database Tables

1. Log into your Supabase project at https://app.supabase.com
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to create all tables

### Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:3000` (for development)
   - Your production URL when deployed

## 2. Twilio Setup

1. Create a Twilio account at https://www.twilio.com
2. Get a phone number with SMS capabilities
3. From your Twilio Console (https://www.twilio.com/console):
   - Copy your **Account SID** → `TWILIO_SID`
   - Copy your **Auth Token** → `TWILIO_AUTH_TOKEN`
   - Your Twilio phone number → `TWILIO_NUMBER`

### Configure Twilio Webhook

1. In Twilio Console, go to your phone number settings
2. Under "Messaging", configure the webhook:
   - **When a message comes in**: `https://your-domain.com/api/sms`
   - HTTP method: POST

## 3. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Twilio
TWILIO_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_NUMBER=+1234567890
```

## 4. Run the Application

```bash
npm install
npm run dev
```

## 5. Test the Flow

1. Visit `http://localhost:3000`
2. Sign up with email (magic link will be sent)
3. Click the link in your email to authenticate
4. Complete onboarding on `/onboard`
5. Send an SMS to your Twilio number - it should save to your dashboard!

## Database Schema

- **families**: Parent/guardian information (linked to auth.users)
- **children**: Multiple children per family
- **entries**: Quotes/moments captured via SMS

All tables have Row Level Security enabled for data protection.
