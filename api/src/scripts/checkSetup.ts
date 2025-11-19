import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://vfhilobaycsxwbjojgjc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function checkSetup() {
    console.log('=================================')
    console.log('🔍 Checking Supabase Setup...')
    console.log('=================================\n')

    // Check connection
    console.log('📡 Testing Supabase connection...')
    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Try to query users table
        const { data, error } = await supabase.from('users').select('count').limit(1)

        if (error) {
            if (error.message.includes('relation') || error.message.includes('does not exist')) {
                console.log('❌ Database tables NOT found!\n')
                console.log('⚠️  You need to set up the database schema first.\n')
                console.log('📋 Follow these steps:')
                console.log('   1. Open: https://vfhilobaycsxwbjojgjc.supabase.co')
                console.log('   2. Go to SQL Editor (left sidebar)')
                console.log('   3. Copy the entire contents of: supabase-schema.sql')
                console.log('   4. Paste and click "Run" (or press F5)')
                console.log('   5. Wait for "Success. No rows returned" message')
                console.log('   6. Run this script again: npx tsx api/src/scripts/checkSetup.ts\n')
                return false
            }
            throw error
        }

        console.log('✅ Connection successful!')
        console.log('✅ Database tables found!\n')

        // Check if admin exists
        const { data: adminUser, error: adminError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'admin')
            .limit(1)
            .single()

        if (adminError && adminError.code !== 'PGRST116') {
            console.log('⚠️  Could not check for admin user')
        } else if (!adminUser) {
            console.log('ℹ️  No admin user found yet.\n')
            console.log('🔑 Create admin user with:')
            console.log('   npx tsx api/src/scripts/createAdmin.ts\n')
        } else {
            console.log('✅ Admin user exists:')
            console.log('   Email:', adminUser.email)
            console.log('   Username:', adminUser.username)
            console.log('   Created:', new Date(adminUser.created_at).toLocaleString())
            console.log('\n🔑 Login with:')
            console.log('   Email: ctfadmin2024@gmail.com')
            console.log('   Password: CTFSecureAdmin@2024!\n')
        }

        console.log('=================================')
        console.log('✅ Setup Check Complete!')
        console.log('=================================\n')
        console.log('🚀 Ready to start? Run: npm run dev\n')
        return true

    } catch (error: any) {
        console.log('❌ Error:', error.message)
        console.log('\n⚠️  Please check your Supabase credentials in .env file\n')
        return false
    }
}

checkSetup().catch(console.error)
