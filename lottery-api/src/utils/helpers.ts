import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../config/constants';
import { JWTPayload } from '../types';
import { type StringValue } from 'ms';

// Generate random OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate referral code
export const generateReferralCode = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Generate ticket number
export const generateTicketNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${timestamp}-${random}`;
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN as StringValue});
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, CONFIG.JWT_SECRET) as JWTPayload;
};

// Calculate withdrawal amount
export const calculateWithdrawalAmount = (
  totalDeposited: number,
  referralEarnings: number
): number => {
  const withdrawalFeePercentage = CONFIG.LOTTERY.WITHDRAWAL_FEE_PERCENTAGE / 100;
  const availableAmount = totalDeposited - referralEarnings;
  const withdrawalFee = availableAmount * withdrawalFeePercentage;
  return Math.max(0, availableAmount - withdrawalFee);
};

// Calculate referral earnings
export const calculateReferralEarnings = (depositAmount: number): number => {
  return (depositAmount * CONFIG.LOTTERY.REFERRAL_PERCENTAGE) / 100;
};

// Get days remaining in draw
export const getDaysRemaining = (endDate: Date): number => {
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
};

// Check if draw is expired
export const isDrawExpired = (endDate: Date): boolean => {
  return new Date() > endDate;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

// Generate UUID
export const generateUUID = (): string => {
  return uuidv4();
};