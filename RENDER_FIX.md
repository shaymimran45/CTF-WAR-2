# 🔧 Render Network Error Fix

## Problem
After deploying to Render, you see "Network error. Please try again." when trying to login.

## Root Cause
The frontend was hardcoded to use `http://localhost:3001/api` which doesn't work in production. On Render, the frontend and backend are served from the same domain, so the API should use relative URLs.

## Solution Applied

### Changed `src/lib/api.ts`:
**Before:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
```

**After:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api'
)
```

### How It Works:
- **Development:** Uses `http://localhost:3001/api` (Vite proxy handles it)
- **Production:** Uses `/api` (same domain as frontend on Render)
- **Custom:** Can override with `VITE_API_URL` environment variable

## Deploy the Fix

### Step 1: Commit Changes
```powershell
git add .
git commit -m "Fix production API URL for Render deployment"
```

### Step 2: Push to GitHub
```powershell
git push origin main
```

### Step 3: Wait for Auto-Deploy
- Render will detect the push
- Auto-deploy starts automatically (~5 minutes)
- Watch progress in Render Dashboard → Logs

### Step 4: Verify
1. Open your Render URL: `https://your-app.onrender.com`
2. Login with:
   - Email: `ctfadmin2024@gmail.com`
   - Password: `CTFSecureAdmin@2024!`
3. Should work now! ✅

## How Render Works

### Architecture:
```
User Browser
    ↓
https://your-app.onrender.com/
    ↓
[Render Server - Port 3001]
    ├─ /api/*           → Express API routes
    ├─ /uploads/*       → Static files
    └─ /*               → React SPA (dist/)
```

### Key Points:
1. **Single Server:** Express serves both API and frontend
2. **No CORS Issues:** Same origin = no CORS problems
3. **Static Files:** `dist/` built by Vite, served by Express
4. **API Routes:** `/api/*` handled by Express routes
5. **SPA Routing:** All non-API routes serve `index.html`

## Testing Locally

### Test Production Build:
```powershell
# Build frontend
npm run build

# Start server (serves both API and frontend)
npm start

# Open browser
# Visit: http://localhost:3001
# Should work exactly like Render!
```

### Test Development:
```powershell
# Run both dev servers
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Vite proxy forwards /api → localhost:3001
```

## Environment Variables on Render

### Already Configured:
- ✅ `NODE_ENV=production`
- ✅ `PORT=3001`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `JWT_SECRET` (auto-generated)
- ✅ `CORS_ORIGIN=*`

### Not Needed:
- ❌ `VITE_API_URL` - Uses default `/api` in production

## Common Issues

### Issue: Still seeing network error after deploy
**Fix:**
1. Check Render logs for errors
2. Verify `/api/health` endpoint works: `https://your-app.onrender.com/api/health`
3. Clear browser cache (Ctrl+Shift+R)
4. Check Network tab in DevTools for actual error

### Issue: 404 on API routes
**Fix:**
- Ensure build completed successfully
- Check `dist/` folder was created
- Verify `npm start` runs `tsx api/server.ts`

### Issue: Admin can't login
**Fix:**
```bash
# In Render Shell:
npx tsx api/src/scripts/createAdmin.ts
```

### Issue: Database errors
**Fix:**
1. Go to Supabase dashboard
2. Run `supabase-schema.sql` in SQL Editor
3. Verify tables created: `users`, `challenges`, `solves`, etc.

## Success Checklist

After deploying the fix, verify:
- [ ] `/api/health` returns `{"success":true,"message":"ok"}`
- [ ] Homepage loads without errors
- [ ] Login form appears
- [ ] Can login with admin credentials
- [ ] Dashboard shows after login
- [ ] Can navigate to Admin Panel
- [ ] Can create challenges
- [ ] Can view leaderboard

## Additional Resources

- **Render Docs:** https://render.com/docs/deploy-node-express-app
- **Express + React SPA:** https://render.com/docs/deploy-create-react-app
- **Troubleshooting:** https://render.com/docs/troubleshooting-deploys

---

## 🎉 Done!

The fix is simple but critical. After pushing to GitHub, Render will auto-deploy and your CTF platform will work perfectly! 

**Estimated Fix Time:** 5-10 minutes (including auto-deploy)

🚀 **Happy CTFing!**
