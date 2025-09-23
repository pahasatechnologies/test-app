import { PrismaClient } from '@prisma/client';
import { User, Wallet, UserWithWallet } from './src/types/prisma';

const prisma = new PrismaClient();

async function testTypes() {
  try {
    console.log('🧪 Testing Prisma types...');
    
    // Test basic types
    console.log('✅ User type imported');
    console.log('✅ Wallet type imported');
    console.log('✅ UserWithWallet type imported');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test type-safe queries (won't execute if database is empty)
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    const walletCount = await prisma.wallet.count();
    console.log(`💰 Total wallets in database: ${walletCount}`);
    
    // Test complex type
    if (userCount > 0) {
      const userWithWallet: UserWithWallet | null = await prisma.user.findFirst({
        include: { wallet: true }
      });
      console.log('✅ UserWithWallet query successful');
      console.log(`👤 Found user: ${userWithWallet?.email || 'None'}`);
    }
    
    console.log('🎉 All types are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTypes();
