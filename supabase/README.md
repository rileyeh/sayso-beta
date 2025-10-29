# Database Setup

This directory contains the SQL schema for the SaySo application.

## Setup Instructions

1. Log into your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the query to create all tables and policies

## Tables

- **families**: Stores parent/guardian information
  - Links to Supabase auth.users via `auth_user_id`
  - Main child's info for SMS references
- **children**: Stores multiple children per family

  - Links to families via `family_id`
  - Supports multiple children per family

- **entries**: Stores quotes/moments captured via SMS
  - Links to families via `family_id`
  - Tracks whether quote was from a prompt or freeform

## Security

All tables have Row Level Security (RLS) enabled:

- Users can only see/edit their own family data
- SMS handler can insert entries via service role key (bypasses RLS)
