import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, email, username, location, password, referredBy } = req.body;
    
    const result = await AuthService.createUser({
      fullName,
      email,
      username,
      location,
      password,
      referredBy
    });
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email for OTP verification.',
      user: result
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User with this email or username already exists') {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === 'Invalid referral code') {
        return res.status(400).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await AuthService.verifyOTP(email, otp);
    
    res.json(result);
  } catch (error) {
    console.error('OTP verification error:', error);
    
    if (error instanceof Error && error.message === 'Invalid or expired OTP') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);
    
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password' || 
          error.message === 'Please verify your email first') {
        return res.status(401).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await AuthService.resendOTP(email);
    
    res.json(result);
  } catch (error) {
    console.error('Resend OTP error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User not found' || 
          error.message === 'Email already verified') {
        return res.status(400).json({ error: error.message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};
