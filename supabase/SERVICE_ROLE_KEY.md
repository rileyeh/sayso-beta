# Service Role Key - What and Why

## What is it?

A special Supabase API key with **elevated permissions** that bypasses Row Level Security (RLS).

## Where to Find It

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon in sidebar)
3. Click **API**
4. Scroll to **Project API keys** section
5. Find **`service_role`** key - this is your secret key

**IMPORTANT:** The service_role key is shown ONLY ONCE when you create a project. If you lost it:

- Create a new project, OR
- Regenerate it (but this will invalidate the old one)

## Why Do We Need It?

The SMS webhook at `/api/sms` needs to:

- Read family records by phone number (no auth context)
- Insert entry records when users reply via SMS

Since there's no authenticated user when Twilio sends the webhook, we need the service_role key to bypass RLS.

## Security Best Practices

✅ **DO:**

- Use it only in server-side code (like API routes)
- Keep it in `.env.local` (already in `.gitignore`)
- Never expose it to the browser

❌ **DON'T:**

- Commit it to git
- Use it in client-side components
- Expose it in the browser

## Alternatives

If you want to avoid service_role, you'd need to:

1. Implement API authentication for the webhook
2. Use a different auth mechanism
3. Or disable RLS (not recommended)

For this app, using service_role for the SMS webhook is the standard approach and safe.
