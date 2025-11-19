# 🚀 Quick Start Guide

Get your CTF platform up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

## Step 1: Clone & Install (30 seconds)

```powershell
cd "d:\WSL\CTF WEBSITE"
npm install
```

## Step 2: Setup Supabase Database (2 minutes)

### Option A: Use Your Existing Project (Fastest)

Your credentials are already configured! Just set up the database:

1. Open https://vfhilobaycsxwbjojgjc.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql`
5. Paste and click **Run** (or press F5)
6. Wait for "Success. No rows returned" message

✅ Done! Your database is ready.

### Option B: Create New Supabase Project

See `SUPABASE_SETUP.md` for detailed instructions.

## Step 3: Verify Environment (10 seconds)

Check that `.env` has these variables (already set for you):

```env
SUPABASE_URL="https://vfhilobaycsxwbjojgjc.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
SUPABASE_ANON_KEY="eyJhbGc..."
JWT_SECRET="ctf-platform-super-secret-key-2024-change-in-production"
```

✅ Looks good!

## Step 4: Create Admin User (30 seconds)

```powershell
$env:ADMIN_EMAIL="admin@ctf.local"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="Admin123!"
npx tsx api/src/scripts/createAdmin.ts
```

You should see: `Created admin: admin@ctf.local`

## Step 5: Start the Application (10 seconds)

```powershell
npm run dev
```

This starts both frontend and backend:
- 🎨 Frontend: http://localhost:5173
- 🔧 Backend: http://localhost:3001

## 🎉 You're Ready!

Open http://localhost:5173 in your browser.

### What to do next:

1. **Login as Admin**
   - Email: `admin@ctf.local`
   - Password: `Admin123!`

2. **Create Your First Challenge**
   - Navigate to Admin Dashboard
   - Click "Create Challenge"
   - Fill in the details and upload files

3. **Test the Platform**
   - Create a test user account
   - Try solving challenges
   - Check the leaderboard

## 🔧 Optional: Start Redis (for caching)

Redis improves performance but isn't required for development:

```powershell
docker-compose up -d
```

## 📝 Important Files

- `README.md` - Full documentation
- `SUPABASE_SETUP.md` - Detailed Supabase guide
- `MIGRATION_SUMMARY.md` - What changed from Prisma
- `supabase-schema.sql` - Database schema

## 🐛 Troubleshooting

### "relation does not exist" error
→ You haven't run the SQL schema yet. Go back to Step 2.

### "Invalid API key" error
→ Check your `.env` file has the correct SUPABASE_SERVICE_ROLE_KEY

### Port already in use
→ Stop other services on ports 3001 or 5173, or change PORT in `.env`

### Cannot connect to Supabase
→ Verify your internet connection and Supabase project is active

## 🎓 Learn More

- Check out `README.md` for API documentation
- Read `SUPABASE_SETUP.md` for advanced setup options
- Join the Supabase Discord for help: https://discord.supabase.com

## 💡 Quick Commands

```powershell
# Development
npm run dev              # Start both frontend & backend
npm run client:dev       # Frontend only
npm run server:dev       # Backend only

# Production
npm run build           # Build for production
npm start               # Start production server

# Utilities
npm run check           # Type checking
npm run lint            # Code linting
```

---

**Need help?** Check the documentation or create an issue on GitHub.

**Ready to deploy?** See deployment instructions in `README.md`.
