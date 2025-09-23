import { PrismaClient } from '@prisma/client';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateOTP, 
  generateReferralCode, 
  generateUUID 
} from '../utils/helpers';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email';
import { CONFIG } from '../config/constants';

const prisma = new PrismaClient();

export class AuthService {
  static async createUser(userData: {
    fullName: string;
    email: string;
    username: string;
    location?: string;
    password: string;
    referredBy?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Validate referral code if provided
      let referralUserId = null;
      if (userData.referredBy) {
        const referralUser = await tx.user.findUnique({
          where: { referralCode: userData.referredBy }
        });
        
        if (!referralUser) {
          throw new Error('Invalid referral code');
        }
        referralUserId = referralUser.id;
      }

      // Create user
      const hashedPassword = await hashPassword(userData.password);
      const userId = generateUUID();
      const referralCode = generateReferralCode();

      const user = await tx.user.create({
        data: {
          id: userId,
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          location: userData.location,
          password: hashedPassword,
          referralCode,
          referredBy: referralUserId
        }
      });

      // Create wallet for user
      await tx.wallet.create({
        data: {
          userId: user.id,
          depositAddress: CONFIG.LOTTERY?.DEPOSIT_ADDRESS || process.env.DEPOSIT_ADDRESS || 'default-address'
        }
      });

      // Generate and store OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await tx.otpVerification.create({
        data: {
          userId: user.id,
          email: user.email,
          otp,
          expiresAt: otpExpiry
        }
      });

      // Send OTP email with fullName parameter
    //   await sendOTPEmail(user.email, otp, user.fullName);

      return { userId: user.id, email: user.email };
    });
  }

  static async verifyOTP(email: string, otp: string) {
    return prisma.$transaction(async (tx) => {
      const otpRecord = await tx.otpVerification.findFirst({
        where: {
          email,
          otp,
          verified: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark OTP as verified
      await tx.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true }
      });

      // Mark user as verified and get user data including referralCode
      const user = await tx.user.update({
        where: { id: otpRecord.userId },
        data: { isEmailVerified: true },
        select: {
          id: true,
          email: true,
          fullName: true,
          username: true,
          referralCode: true
        }
      });

      // Send welcome email with fullName and referralCode
      await sendWelcomeEmail(user.email, user.fullName, user.referralCode);

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: 'user'
      });

      return { 
        message: 'Email verified successfully! Welcome to the lottery system.',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          referralCode: user.referralCode,
          isEmailVerified: true
        }
      };
    });
  }

  static async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email first');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role as 'admin' | 'user'
    });

    return { 
      token, 
      user: { 
        id: user.id, 
        fullName: user.fullName,
        email: user.email, 
        username: user.username, 
        role: user.role,
        referralCode: user.referralCode,
        isEmailVerified: user.isEmailVerified
      } 
    };
  }

  static async resendOTP(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        isEmailVerified: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    return prisma.$transaction(async (tx) => {
      // Delete existing OTP records
      await tx.otpVerification.deleteMany({
        where: { email }
      });

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await tx.otpVerification.create({
        data: {
          userId: user.id,
          email,
          otp,
          expiresAt: otpExpiry
        }
      });

      // Send OTP email with fullName parameter
      await sendOTPEmail(email, otp, user.fullName);
      return { message: 'OTP sent successfully' };
    });
  }
}
