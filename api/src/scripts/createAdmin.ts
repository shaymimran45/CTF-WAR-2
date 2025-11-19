import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // Fixed secure admin credentials
  const email = process.env.ADMIN_EMAIL || 'ctfadmin2024@gmail.com'
  const username = process.env.ADMIN_USERNAME || 'ctfadmin'
  const password = process.env.ADMIN_PASSWORD || 'CTFSecureAdmin@2024!'

  console.log('Creating/Updating admin account...')
  console.log('Email:', email)
  console.log('Username:', username)
  console.log('Password:', password)
  console.log('')

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  const passwordHash = await bcrypt.hash(password, 12)

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'admin', passwordHash, username, email }
    })
    console.log('✅ Admin account updated successfully!')
    console.log('   Email:', updated.email)
    console.log('   Username:', updated.username)
    console.log('   Role:', updated.role)
  } else {
    const user = await prisma.user.create({
      data: { email, username, passwordHash, role: 'admin' }
    })
    console.log('✅ Admin account created successfully!')
    console.log('   Email:', user.email)
    console.log('   Username:', user.username)
    console.log('   Role:', user.role)
  }

  console.log('')
  console.log('🔑 Login Credentials:')
  console.log('   Email:', email)
  console.log('   Password:', password)
  console.log('')
  console.log('⚠️  Remember to keep these credentials secure!')
}

main().finally(() => prisma.$disconnect())