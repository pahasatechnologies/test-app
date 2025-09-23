import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { CONFIG } from '../config/constants';

dotenv.config();

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lottery.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        wallet: {
          create: {
            balance: 0
          }
        }
      }
    });

    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔑 Password: [specified in env or default]');

  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();