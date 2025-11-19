import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://vfhilobaycsxwbjojgjc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

let testsPassed = 0
let testsFailed = 0

function logTest(name: string, passed: boolean, details?: string) {
    if (passed) {
        console.log(`✅ ${name}`)
        testsPassed++
    } else {
        console.log(`❌ ${name}`)
        if (details) console.log(`   ${details}`)
        testsFailed++
    }
}

async function testDatabase() {
    console.log('\n=================================')
    console.log('🧪 Testing CTF Platform Database')
    console.log('=================================\n')

    // Test 1: Connection
    console.log('📡 Testing Connection...')
    try {
        const { error } = await supabase.from('users').select('count').limit(1)
        logTest('Supabase connection', !error)
    } catch (error: any) {
        logTest('Supabase connection', false, error.message)
        return
    }

    // Test 2: Admin User
    console.log('\n👤 Testing Admin User...')
    try {
        const { data: admin, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'ctfadmin2024@gmail.com')
            .single()

        logTest('Admin user exists', !error && !!admin)
        if (admin) {
            logTest('Admin has correct role', admin.role === 'admin')
            logTest('Admin username correct', admin.username === 'ctfadmin')
            console.log(`   ID: ${admin.id}`)
            console.log(`   Email: ${admin.email}`)
            console.log(`   Created: ${new Date(admin.created_at).toLocaleString()}`)
        }
    } catch (error: any) {
        logTest('Admin user check', false, error.message)
    }

    // Test 3: Create Test User
    console.log('\n👥 Testing User Operations...')
    const testUserEmail = `testuser_${Date.now()}@test.com`
    const testUsername = `testuser_${Date.now()}`
    let testUserId: string | null = null

    try {
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                email: testUserEmail,
                username: testUsername,
                password_hash: '$2a$12$test_hash',
                role: 'user'
            })
            .select()
            .single()

        logTest('Create test user', !error && !!newUser)
        if (newUser) {
            testUserId = newUser.id
            console.log(`   User ID: ${testUserId}`)
        }
    } catch (error: any) {
        logTest('Create test user', false, error.message)
    }

    // Test 4: Read User
    if (testUserId) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', testUserId)
                .single()

            logTest('Read user', !error && !!user)
        } catch (error: any) {
            logTest('Read user', false, error.message)
        }
    }

    // Test 5: Competition
    console.log('\n🏆 Testing Competition Operations...')
    let competitionId: string | null = null

    try {
        const { data: comp, error } = await supabase
            .from('competitions')
            .insert({
                name: `Test Competition ${Date.now()}`,
                description: 'Automated test competition',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                competition_type: 'individual',
                is_public: true
            })
            .select()
            .single()

        logTest('Create competition', !error && !!comp)
        if (comp) {
            competitionId = comp.id
            console.log(`   Competition ID: ${competitionId}`)
        }
    } catch (error: any) {
        logTest('Create competition', false, error.message)
    }

    // Test 6: Challenge
    console.log('\n🎯 Testing Challenge Operations...')
    let challengeId: string | null = null

    if (competitionId) {
        try {
            const { data: challenge, error } = await supabase
                .from('challenges')
                .insert({
                    title: `Test Challenge ${Date.now()}`,
                    description: 'This is a test challenge for automated testing',
                    category: 'test',
                    difficulty: 'easy',
                    points: 100,
                    flag: 'CTF{test_flag_12345}',
                    competition_id: competitionId,
                    is_visible: true,
                    max_attempts: 0
                })
                .select()
                .single()

            logTest('Create challenge', !error && !!challenge)
            if (challenge) {
                challengeId = challenge.id
                console.log(`   Challenge ID: ${challengeId}`)
                console.log(`   Flag: ${challenge.flag}`)
            }
        } catch (error: any) {
            logTest('Create challenge', false, error.message)
        }

        // Test 7: Dynamic Flag Format
        if (challengeId) {
            try {
                // Test with same value but different allowed prefixes
                const testFlags = [
                    { flag: 'flag{test_flag_12345}', shouldMatch: true },
                    { flag: 'FLAG{test_flag_12345}', shouldMatch: true },
                    { flag: 'ctf{test_flag_12345}', shouldMatch: true },
                    { flag: 'CTF{test_flag_12345}', shouldMatch: true },
                    { flag: 'WRONG{test_flag_12345}', shouldMatch: false },
                    { flag: 'CTF{wrong_value}', shouldMatch: false }
                ]

                console.log('\n🚩 Testing Dynamic Flag Format...')
                for (const test of testFlags) {
                    // This simulates the flag checking logic from challengeController
                    const allowedPrefixes = (process.env.FLAG_PREFIXES || 'CTF,flag,FLAG,ctf').split(',').map(s => s.trim())
                    const parseFlag = (f: string) => {
                        const m = f.match(/^([A-Za-z0-9_]+)\{(.+)\}$/)
                        if (!m) return { raw: f.trim(), prefix: null as string | null, value: null as string | null }
                        return { raw: f.trim(), prefix: m[1], value: m[2] }
                    }

                    const submitted = parseFlag(test.flag)
                    const correct = parseFlag('CTF{test_flag_12345}')

                    let isCorrect = false
                    if (correct.value !== null && submitted.prefix !== null) {
                        const prefixOk = submitted.prefix === correct.prefix || allowedPrefixes.includes(submitted.prefix)
                        isCorrect = prefixOk && submitted.value === correct.value
                    }

                    const passed = isCorrect === test.shouldMatch
                    logTest(`Flag: ${test.flag} → ${isCorrect ? 'ACCEPTED' : 'REJECTED'}`, passed)
                }
            } catch (error: any) {
                logTest('Dynamic flag format', false, error.message)
            }
        }
    }

    // Test 8: Submission
    console.log('\n📝 Testing Submission Operations...')
    if (testUserId && challengeId) {
        try {
            const { data: submission, error } = await supabase
                .from('submissions')
                .insert({
                    user_id: testUserId,
                    challenge_id: challengeId,
                    submitted_flag: 'CTF{wrong_flag}',
                    is_correct: false,
                    points_awarded: 0
                })
                .select()
                .single()

            logTest('Create incorrect submission', !error && !!submission)

            // Correct submission
            const { data: correctSub, error: correctError } = await supabase
                .from('submissions')
                .insert({
                    user_id: testUserId,
                    challenge_id: challengeId,
                    submitted_flag: 'CTF{test_flag_12345}',
                    is_correct: true,
                    points_awarded: 100
                })
                .select()
                .single()

            logTest('Create correct submission', !correctError && !!correctSub)

            // Test 9: Solve
            if (correctSub) {
                console.log('\n🎉 Testing Solve Operations...')
                const { data: solve, error: solveError } = await supabase
                    .from('solves')
                    .insert({
                        user_id: testUserId,
                        challenge_id: challengeId,
                        submission_id: correctSub.id,
                        points_awarded: 100
                    })
                    .select()
                    .single()

                logTest('Create solve record', !solveError && !!solve)
            }
        } catch (error: any) {
            logTest('Submission operations', false, error.message)
        }
    }

    // Test 10: Team Operations
    console.log('\n👥 Testing Team Operations...')
    let teamId: string | null = null

    if (testUserId) {
        try {
            const { data: team, error } = await supabase
                .from('teams')
                .insert({
                    name: `Test Team ${Date.now()}`,
                    description: 'Test team for automated testing',
                    leader_id: testUserId,
                    max_members: 5
                })
                .select()
                .single()

            logTest('Create team', !error && !!team)
            if (team) {
                teamId = team.id
                console.log(`   Team ID: ${teamId}`)
                console.log(`   Invite Code: ${team.invite_code}`)

                // Add team member
                const { data: member, error: memberError } = await supabase
                    .from('team_members')
                    .insert({
                        team_id: teamId,
                        user_id: testUserId
                    })
                    .select()
                    .single()

                logTest('Add team member', !memberError && !!member)
            }
        } catch (error: any) {
            logTest('Team operations', false, error.message)
        }
    }

    // Test 11: Hint Operations
    console.log('\n💡 Testing Hint Operations...')
    if (challengeId) {
        try {
            const { data: hint, error } = await supabase
                .from('hints')
                .insert({
                    challenge_id: challengeId,
                    content: 'This is a test hint',
                    penalty: 10
                })
                .select()
                .single()

            logTest('Create hint', !error && !!hint)
        } catch (error: any) {
            logTest('Create hint', false, error.message)
        }
    }

    // Test 12: File Upload Simulation
    console.log('\n📁 Testing File Upload System...')
    const uploadDir = process.env.UPLOAD_DIR || 'uploads'

    try {
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        logTest('Upload directory exists', true)

        // Create test file
        const testFilePath = path.join(uploadDir, `test_${Date.now()}.txt`)
        fs.writeFileSync(testFilePath, 'This is a test file for CTF platform')
        logTest('Create test file', fs.existsSync(testFilePath))

        // Add file record to database
        if (challengeId && fs.existsSync(testFilePath)) {
            const stats = fs.statSync(testFilePath)
            const { data: file, error } = await supabase
                .from('challenge_files')
                .insert({
                    challenge_id: challengeId,
                    filename: 'test_file.txt',
                    file_path: testFilePath,
                    file_size: stats.size
                })
                .select()
                .single()

            logTest('Store file metadata in database', !error && !!file)

            if (file) {
                // Test file retrieval
                const { data: retrievedFile, error: retrieveError } = await supabase
                    .from('challenge_files')
                    .select('*')
                    .eq('id', file.id)
                    .single()

                logTest('Retrieve file metadata', !retrieveError && !!retrievedFile)

                if (retrievedFile && fs.existsSync(retrievedFile.file_path)) {
                    const content = fs.readFileSync(retrievedFile.file_path, 'utf-8')
                    logTest('Read file content', content.includes('test file'))
                }
            }
        }
    } catch (error: any) {
        logTest('File operations', false, error.message)
    }

    // Test 13: Leaderboard Query
    console.log('\n🏅 Testing Leaderboard Query...')
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select(`
        id,
        username,
        email,
        solves(points_awarded)
      `)
            .limit(10)

        logTest('Query leaderboard data', !error && !!users)
        if (users) {
            console.log(`   Retrieved ${users.length} users`)
        }
    } catch (error: any) {
        logTest('Leaderboard query', false, error.message)
    }

    // Test 14: Update Operations
    console.log('\n✏️  Testing Update Operations...')
    if (testUserId) {
        try {
            const { data: updated, error } = await supabase
                .from('users')
                .update({ username: `${testUsername}_updated` })
                .eq('id', testUserId)
                .select()
                .single()

            logTest('Update user', !error && !!updated && updated.username.includes('_updated'))
        } catch (error: any) {
            logTest('Update user', false, error.message)
        }
    }

    // Cleanup Test Data
    console.log('\n🧹 Cleaning Up Test Data...')
    try {
        if (challengeId) {
            await supabase.from('challenge_files').delete().eq('challenge_id', challengeId)
            await supabase.from('hints').delete().eq('challenge_id', challengeId)
            await supabase.from('solves').delete().eq('challenge_id', challengeId)
            await supabase.from('submissions').delete().eq('challenge_id', challengeId)
            await supabase.from('challenges').delete().eq('id', challengeId)
        }
        if (teamId) {
            await supabase.from('team_members').delete().eq('team_id', teamId)
            await supabase.from('teams').delete().eq('id', teamId)
        }
        if (testUserId) {
            await supabase.from('users').delete().eq('id', testUserId)
        }
        if (competitionId) {
            await supabase.from('competitions').delete().eq('id', competitionId)
        }

        // Clean up test files
        const files = fs.readdirSync(uploadDir).filter(f => f.startsWith('test_'))
        files.forEach(f => {
            try {
                fs.unlinkSync(path.join(uploadDir, f))
            } catch { }
        })

        logTest('Cleanup test data', true)
    } catch (error: any) {
        logTest('Cleanup test data', false, error.message)
    }

    // Summary
    console.log('\n=================================')
    console.log('📊 Test Summary')
    console.log('=================================')
    console.log(`✅ Passed: ${testsPassed}`)
    console.log(`❌ Failed: ${testsFailed}`)
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`)
    console.log('=================================\n')

    if (testsFailed === 0) {
        console.log('🎉 All tests passed! Your database is working perfectly!\n')
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.\n')
    }
}

testDatabase().catch(console.error)
