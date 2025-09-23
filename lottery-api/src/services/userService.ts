import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateReferralCode, generateUUID } from '../utils/helpers';

const prisma = new PrismaClient();

export class UserService {
  static async createUser(userData: {
    fullName: string;
    email: string;
    username: string;
    location?: string;
    password: string;
    referredBy?: string;
  }) {
    const hashedPassword = await hashPassword(userData.password);
    const referralCode = generateReferralCode();
    const userId = generateUUID();
    
    let referralUserId = null;
    if (userData.referredBy) {
      const referralUser = await prisma.user.findUnique({
        where: { referralCode: userData.referredBy }
      });
      if (!referralUser) {
        throw new Error('Invalid referral code');
      }
      referralUserId = referralUser.id;
    }
    
    return prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          location: userData.location,
          password: hashedPassword,
          referralCode,
          referredBy: referralUserId,
        }
      });
      
      await tx.wallet.create({
        data: {
          userId: user.id,
          depositAddress: process.env.DEPOSIT_ADDRESS || 'default-address'
        }
      });
      
      return user;
    });
  }
  
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }
  
  static async verifyUserEmail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });
  }
  
  static async getUserStats() {
    const [totalUsers, verifiedUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { isEmailVerified: true, role: 'user' } })
    ]);
    
    return { totalUsers, verifiedUsers };
  }
}
