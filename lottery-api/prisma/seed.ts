import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting seed process...')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@lottery.com' },
      update: {},
      create: {
        fullName: 'System Administrator',
        email: 'admin@lottery.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        referralCode: 'ADMIN001',
        location: 'System'
      }
    })

    console.log('✅ Admin user created:', adminUser.email)

    // Create admin wallet
    await prisma.wallet.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        depositAddress: 'admin-deposit-address',
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        referralEarnings: 0
      }
    })

    // Create system configurations
    const systemConfigs = [
      { key: 'EMAIL_HOST', value: 'smtp.gmail.com', description: 'SMTP server host for email', category: 'email' },
      { key: 'EMAIL_PORT', value: '587', description: 'SMTP server port', category: 'email' },
      { key: 'EMAIL_USER', value: 'your-email@gmail.com', description: 'Email address for sending emails', category: 'email' },
      { key: 'EMAIL_PASS', value: 'your-app-password', description: 'Email password or app password', category: 'email' },
      { key: 'TICKET_PRICE', value: '100', description: 'Price per lottery ticket', category: 'lottery' },
      { key: 'FIRST_PRIZE', value: '2000', description: 'First prize amount', category: 'lottery' },
      { key: 'SECOND_PRIZE', value: '1000', description: 'Second prize amount', category: 'lottery' },
      { key: 'THIRD_PRIZE', value: '500', description: 'Third prize amount', category: 'lottery' },
      { key: 'REFERRAL_PERCENTAGE', value: '10', description: 'Referral commission percentage', category: 'lottery' },
      { key: 'WITHDRAWAL_FEE_PERCENTAGE', value: '10', description: 'Withdrawal fee percentage', category: 'lottery' },
      { key: 'DEPOSIT_ADDRESS', value: 'your-crypto-deposit-address', description: 'Crypto deposit address', category: 'lottery' },
      { key: 'DRAW_DURATION_DAYS', value: '30', description: 'Duration of each draw in days', category: 'draw' },
      { key: 'SURPRISE_DEPOSIT_THRESHOLD', value: '5', description: 'Minimum deposits to activate surprise', category: 'draw' }
    ]

    for (const config of systemConfigs) {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: config
      })
    }

    console.log('✅ System configurations created')
    console.log('🎉 Seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
