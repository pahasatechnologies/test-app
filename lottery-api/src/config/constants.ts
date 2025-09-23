import dotenv from 'dotenv';
import { type StringValue } from 'ms';

dotenv.config();

interface Config {
  PORT: number | string;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string | number | StringValue;
  EMAIL: {
    HOST: string;
    PORT: number;
    USER: string;
    PASS: string;
  };
  LOTTERY: {
    TICKET_PRICE: number;
    FIRST_PRIZE: number;
    SECOND_PRIZE: number;
    THIRD_PRIZE: number;
    REFERRAL_PERCENTAGE: number;
    WITHDRAWAL_FEE_PERCENTAGE: number;
    DEPOSIT_ADDRESS: string;
    DRAW_DURATION_DAYS: number;
    SURPRISE_DEPOSIT_THRESHOLD: number;
  };
}

export const CONFIG: Config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT || '587'),
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
  },
  LOTTERY: {
    TICKET_PRICE: parseFloat(process.env.TICKET_PRICE || '100'),
    FIRST_PRIZE: parseFloat(process.env.FIRST_PRIZE || '2000'),
    SECOND_PRIZE: parseFloat(process.env.SECOND_PRIZE || '1000'),
    THIRD_PRIZE: parseFloat(process.env.THIRD_PRIZE || '500'),
    REFERRAL_PERCENTAGE: parseFloat(process.env.REFERRAL_PERCENTAGE || '10'),
    WITHDRAWAL_FEE_PERCENTAGE: parseFloat(process.env.WITHDRAWAL_FEE_PERCENTAGE || '10'),
    DEPOSIT_ADDRESS: process.env.DEPOSIT_ADDRESS || 'your-deposit-address',
    DRAW_DURATION_DAYS: parseInt(process.env.DRAW_DURATION_DAYS || '30'),
    SURPRISE_DEPOSIT_THRESHOLD: parseInt(process.env.SURPRISE_DEPOSIT_THRESHOLD || '5'),
  },
};