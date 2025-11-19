# Quick Setup Script for CTF Platform with Supabase

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CTF Platform - Supabase Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env file created. Please update it with your Supabase credentials." -ForegroundColor Green
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "[OK] Dependencies installed." -ForegroundColor Green
}
else {
    Write-Host "[OK] Dependencies already installed." -ForegroundColor Green
}
Write-Host ""

# Check if Supabase credentials are set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your-supabase-url" -or $envContent -match "your-service-role-key") {
    Write-Host "[WARNING] Default Supabase credentials detected in .env" -ForegroundColor Red
    Write-Host "   Please update .env with your actual Supabase credentials:" -ForegroundColor Yellow
    Write-Host "   1. SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "   2. SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    Write-Host "   3. SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Or use the pre-configured credentials already in your .env file." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1] Set up Supabase Database:" -ForegroundColor White
Write-Host "   - Go to: https://vfhilobaycsxwbjojgjc.supabase.co" -ForegroundColor Gray
Write-Host "   - Navigate to SQL Editor" -ForegroundColor Gray
Write-Host "   - Run the SQL from: supabase-schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "[2] Start Redis (optional, for sessions/caching):" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "[3] Create Admin User:" -ForegroundColor White
Write-Host '   $env:ADMIN_EMAIL="admin@example.com"' -ForegroundColor Gray
Write-Host '   $env:ADMIN_USERNAME="admin"' -ForegroundColor Gray
Write-Host '   $env:ADMIN_PASSWORD="Admin123!"' -ForegroundColor Gray
Write-Host "   npx tsx api/src/scripts/createAdmin.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "[4] Start Development Server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "- README.md - Project overview and setup" -ForegroundColor Gray
Write-Host "- SUPABASE_SETUP.md - Detailed Supabase setup guide" -ForegroundColor Gray
Write-Host "- MIGRATION_SUMMARY.md - Migration details" -ForegroundColor Gray
Write-Host ""
Write-Host "[OK] Setup script complete!" -ForegroundColor Green
Write-Host ""
