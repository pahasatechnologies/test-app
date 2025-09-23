import { Request, Response, NextFunction } from 'express';
import { isValidEmail, isValidPassword } from '../utils/helpers';

export const validateSignup = (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, username, password, confirmPassword } = req.body;

  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters long' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  if (!username || username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  if (!password || !isValidPassword(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

export const validateOTP = (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be a 6-digit number' });
  }

  next();
};

export const validateWithdrawal = (req: Request, res: Response, next: NextFunction) => {
  const { fullName, walletAddress, amount } = req.body;

  if (!fullName || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  if (!walletAddress || walletAddress.trim().length < 10) {
    return res.status(400).json({ error: 'Valid wallet address is required' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  next();
};