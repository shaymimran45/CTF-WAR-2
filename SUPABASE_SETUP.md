# Supabase Setup Guide

This guide will help you set up Supabase for your CTF Platform.

## Option 1: Using Supabase Dashboard (Recommended for Quick Setup)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - Name: CTF Platform
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
4. Click "Create new project"
5. Wait for the project to be created (~2 minutes)

### Step 2: Get Your API Keys

1. Go to Project Settings > API
2. Copy the following:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - `anon` `public` key
   - `service_role` `secret` key (⚠️ Keep this secret!)

### Step 3: Update Environment Variables

Update your `.env` file:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_ANON_KEY="your-anon-key"
```

### Step 4: Create Database Tables

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. Verify all tables were created in Table Editor

### Step 5: Test Your Setup

Run the backend server:

```bash
npm run server:dev
```

If you see "Server ready on port 3001", you're all set! ✅

---

## Option 2: Using Supabase CLI (Advanced)

### Prerequisites

- Node.js 18+
- Docker Desktop (for local development)

### Step 1: Install Supabase CLI

```powershell
# Using npm
npm install -g supabase

# Or using scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Initialize Supabase Locally

```powershell
# Navigate to your project directory
cd "d:\WSL\CTF WEBSITE"

# Initialize Supabase
supabase init

# Start local Supabase (requires Docker)
supabase start
```

This will start:
- PostgreSQL database on port 54322
- Supabase Studio on http://localhost:54323
- API Gateway on http://localhost:54321

### Step 3: Link to Remote Project (Optional)

If you want to sync with a remote Supabase project:

```powershell
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push schema to remote
supabase db push
```

### Step 4: Apply Database Schema

```powershell
# Create a new migration
supabase migration new init_ctf_schema

# Copy the contents of supabase-schema.sql to the new migration file
# Then apply migrations
supabase db reset
```

### Step 5: Get Local Development Credentials

After `supabase start`, you'll see output like:

```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

Update your `.env` for local development:

```env
SUPABASE_URL="http://localhost:54321"
SUPABASE_SERVICE_ROLE_KEY="<service_role key from output>"
SUPABASE_ANON_KEY="<anon key from output>"
```

### Step 6: Useful CLI Commands

```powershell
# Check status
supabase status

# Stop all services
supabase stop

# View logs
supabase logs

# Generate TypeScript types from database schema
supabase gen types typescript --local > types/supabase.ts

# Create a new migration
supabase migration new migration_name

# Apply migrations
supabase db reset

# Push changes to remote
supabase db push

# Pull changes from remote
supabase db pull
```

---

## Option 3: Using Your Provided Credentials

You've already provided Supabase credentials. Here's how to use them:

### Your Credentials

```env
SUPABASE_URL="https://vfhilobaycsxwbjojgjc.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaGlsb2JheWNzeHdiam9qZ2pjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUzMTAwOCwiZXhwIjoyMDc5MTA3MDA4fQ.cjZaPWBs_t_ScE-A9p_Ew0YOSA29GLvgiMK6JcDJBvc"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaGlsb2JheWNzeHdiam9qZ2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MzEwMDgsImV4cCI6MjA3OTEwNzAwOH0.9SFxiwMbCFoYJi8ITwOp7jEKacXkJFyRPvWtTRRMMvw"
```

These are already configured in your `.env` file! ✅

### Next Steps

1. Go to https://vfhilobaycsxwbjojgjc.supabase.co
2. Sign in to your Supabase account
3. Navigate to SQL Editor
4. Run the `supabase-schema.sql` script
5. Start your application with `npm run dev`

---

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Verify your SUPABASE_URL and keys are correct
2. Check if your IP is allowed (Supabase allows all IPs by default)
3. Ensure your Supabase project is active

### Table Not Found Errors

If you see "table does not exist":

1. Verify the schema was applied in Supabase SQL Editor
2. Check Table Editor to see if tables exist
3. Re-run the `supabase-schema.sql` if needed

### Permission Errors

If you see "permission denied":

1. Make sure you're using the SERVICE_ROLE_KEY (not anon key)
2. Check Row Level Security policies if enabled
3. The adapter uses service_role which bypasses RLS

### Migration from Prisma

Your project has been successfully migrated from Prisma to Supabase! The adapter in `api/src/lib/prisma.ts` provides a Prisma-like API that works with Supabase, so your controller code didn't need to change.

---

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit service_role keys** to version control
2. Use environment variables for all sensitive keys
3. The anon key is safe for frontend use
4. The service_role key should ONLY be used on the backend
5. Consider enabling Row Level Security (RLS) for production
6. Rotate your keys periodically in production

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## Support

If you encounter any issues:

1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review [GitHub Issues](https://github.com/supabase/supabase/issues)
3. Check the project README.md for more information
