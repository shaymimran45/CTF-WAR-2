import fs from 'fs'
import path from 'path'

console.log('\n=================================')
console.log('📋 Render Deployment Checklist')
console.log('=================================\n')

let allGood = true
const warnings: string[] = []
const errors: string[] = []

// Check 1: Required files
console.log('📁 Checking Required Files...')
const requiredFiles = [
    'package.json',
    'render.yaml',
    'build.sh',
    'start.sh',
    'supabase-schema.sql',
    '.env.example',
    'api/app.ts',
    'api/server.ts'
]

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`)
    } else {
        console.log(`   ❌ ${file} - MISSING!`)
        errors.push(`Missing required file: ${file}`)
        allGood = false
    }
})

// Check 2: package.json scripts
console.log('\n📦 Checking Package.json Scripts...')
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))

    const requiredScripts = ['build', 'start']
    requiredScripts.forEach(script => {
        if (pkg.scripts[script]) {
            console.log(`   ✅ ${script}: ${pkg.scripts[script]}`)
        } else {
            console.log(`   ❌ ${script} script missing!`)
            errors.push(`Missing npm script: ${script}`)
            allGood = false
        }
    })

    // Check dependencies
    const criticalDeps = ['express', '@supabase/supabase-js', 'dotenv', 'tsx']
    console.log('\n📚 Checking Critical Dependencies...')
    criticalDeps.forEach(dep => {
        if (pkg.dependencies[dep] || pkg.devDependencies[dep]) {
            console.log(`   ✅ ${dep}`)
        } else {
            console.log(`   ⚠️  ${dep} - not found`)
            warnings.push(`Missing dependency: ${dep}`)
        }
    })
} catch (error) {
    console.log('   ❌ Error reading package.json')
    errors.push('Cannot read package.json')
    allGood = false
}

// Check 3: Environment variables template
console.log('\n🔐 Checking Environment Variables Template...')
try {
    const envExample = fs.readFileSync('.env.example', 'utf-8')
    const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'JWT_SECRET',
        'ADMIN_EMAIL',
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD',
        'FLAG_PREFIXES'
    ]

    requiredVars.forEach(varName => {
        if (envExample.includes(varName)) {
            console.log(`   ✅ ${varName}`)
        } else {
            console.log(`   ⚠️  ${varName} - not in .env.example`)
            warnings.push(`Environment variable ${varName} not documented in .env.example`)
        }
    })
} catch (error) {
    console.log('   ❌ Error reading .env.example')
    errors.push('Cannot read .env.example')
}

// Check 4: Build scripts executable
console.log('\n🔧 Checking Build Scripts...')
const scripts = ['build.sh', 'start.sh']
scripts.forEach(script => {
    if (fs.existsSync(script)) {
        const content = fs.readFileSync(script, 'utf-8')
        if (content.includes('#!/bin/bash')) {
            console.log(`   ✅ ${script} has shebang`)
        } else {
            console.log(`   ⚠️  ${script} missing shebang`)
            warnings.push(`${script} should start with #!/bin/bash`)
        }
    }
})

// Check 5: Uploads directory
console.log('\n📁 Checking Uploads Directory...')
if (fs.existsSync('uploads')) {
    console.log('   ✅ uploads/ directory exists')
} else {
    console.log('   ⚠️  uploads/ directory not found - creating...')
    fs.mkdirSync('uploads', { recursive: true })
    fs.writeFileSync('uploads/.gitkeep', '# Placeholder\n')
    console.log('   ✅ Created uploads/ directory')
}

// Check 6: Git repository
console.log('\n🔗 Checking Git Repository...')
if (fs.existsSync('.git')) {
    console.log('   ✅ Git repository initialized')

    // Check for .gitignore
    if (fs.existsSync('.gitignore')) {
        console.log('   ✅ .gitignore exists')
        const gitignore = fs.readFileSync('.gitignore', 'utf-8')
        if (gitignore.includes('.env') && gitignore.includes('node_modules')) {
            console.log('   ✅ .gitignore properly configured')
        } else {
            console.log('   ⚠️  .gitignore may be incomplete')
            warnings.push('.gitignore should exclude .env and node_modules')
        }
    } else {
        console.log('   ⚠️  .gitignore not found')
        warnings.push('Create a .gitignore file')
    }
} else {
    console.log('   ⚠️  Not a git repository')
    console.log('   Run: git init')
    warnings.push('Initialize git repository before deploying')
}

// Check 7: API health endpoint
console.log('\n🏥 Checking API Health Endpoint...')
try {
    const appContent = fs.readFileSync('api/app.ts', 'utf-8')
    if (appContent.includes('/api/health')) {
        console.log('   ✅ Health endpoint defined in api/app.ts')
    } else {
        console.log('   ⚠️  Health endpoint not found')
        warnings.push('Health endpoint /api/health should be defined')
    }
} catch (error) {
    console.log('   ❌ Cannot read api/app.ts')
}

// Check 8: Database schema
console.log('\n🗄️  Checking Database Schema...')
if (fs.existsSync('supabase-schema.sql')) {
    const schema = fs.readFileSync('supabase-schema.sql', 'utf-8')
    const tables = ['users', 'teams', 'challenges', 'submissions', 'solves']

    tables.forEach(table => {
        if (schema.includes(`CREATE TABLE`) && schema.includes(table)) {
            console.log(`   ✅ ${table} table definition found`)
        } else {
            console.log(`   ⚠️  ${table} table definition not found`)
            warnings.push(`Table ${table} should be defined in schema`)
        }
    })
} else {
    console.log('   ❌ supabase-schema.sql not found')
    errors.push('Database schema file is required')
}

// Check 9: render.yaml configuration
console.log('\n⚙️  Checking Render Configuration...')
if (fs.existsSync('render.yaml')) {
    try {
        const renderYaml = fs.readFileSync('render.yaml', 'utf-8')

        if (renderYaml.includes('type: web')) {
            console.log('   ✅ Web service type configured')
        }
        if (renderYaml.includes('buildCommand')) {
            console.log('   ✅ Build command specified')
        }
        if (renderYaml.includes('startCommand')) {
            console.log('   ✅ Start command specified')
        }
        if (renderYaml.includes('SUPABASE_URL')) {
            console.log('   ✅ Supabase environment variables configured')
        }
    } catch (error) {
        console.log('   ⚠️  Error reading render.yaml')
    }
} else {
    console.log('   ❌ render.yaml not found')
    errors.push('render.yaml configuration file is required')
}

// Check 10: TypeScript configuration
console.log('\n📘 Checking TypeScript Configuration...')
if (fs.existsSync('tsconfig.json')) {
    console.log('   ✅ tsconfig.json exists')
} else {
    console.log('   ⚠️  tsconfig.json not found')
    warnings.push('TypeScript configuration recommended')
}

// Summary
console.log('\n=================================')
console.log('📊 Summary')
console.log('=================================\n')

if (errors.length > 0) {
    console.log('❌ ERRORS (Must Fix):')
    errors.forEach(err => console.log(`   • ${err}`))
    console.log('')
}

if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (Recommended):')
    warnings.forEach(warn => console.log(`   • ${warn}`))
    console.log('')
}

if (allGood && errors.length === 0) {
    console.log('✅ All checks passed!')
    console.log('\n🚀 You are ready to deploy to Render!')
    console.log('\n📋 Next Steps:')
    console.log('   1. Push code to GitHub: git push origin main')
    console.log('   2. Go to https://render.com')
    console.log('   3. Create new Blueprint from your repo')
    console.log('   4. Follow RENDER_DEPLOYMENT.md guide')
    console.log('\n📖 Documentation:')
    console.log('   • RENDER_DEPLOYMENT.md - Complete deployment guide')
    console.log('   • QUICKSTART.md - Quick start guide')
    console.log('   • README.md - Project overview')
} else {
    console.log('⚠️  Please fix the errors above before deploying.')
    console.log('\n📖 See RENDER_DEPLOYMENT.md for detailed deployment instructions.')
}

console.log('\n=================================\n')
