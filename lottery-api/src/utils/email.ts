import nodemailer from 'nodemailer';
import { CONFIG } from '../config/constants';

// Fixed: createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  host: CONFIG.EMAIL.HOST,
  port: CONFIG.EMAIL.PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: CONFIG.EMAIL.USER,
    pass: CONFIG.EMAIL.PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string, fullName: string) => {
  const mailOptions = {
    from: CONFIG.EMAIL.USER,
    to: email,
    subject: 'Email Verification - Lottery System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for signing up for our lottery system! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h3 style="color: #007bff; font-size: 24px; margin: 0;">${otp}</h3>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>Lottery System Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // throw new Error('Failed to send OTP email');
  }
};

export const sendWelcomeEmail = async (email: string, fullName: string, referralCode: string) => {
  const mailOptions = {
    from: CONFIG.EMAIL.USER,
    to: email,
    subject: 'Welcome to Lottery System!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Lottery System!</h2>
        <p>Hello ${fullName},</p>
        <p>Congratulations! Your email has been verified and your account is now active.</p>
        <p>Your wallet has been automatically created and is ready to use.</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0;">
          <h4>Your Referral Code: <span style="color: #007bff;">${referralCode}</span></h4>
          <p>Share this code with friends and earn ${process.env.REFERRAL_PERCENTAGE || 10}% of their deposits!</p>
        </div>
        <p>You can now start purchasing lottery tickets and have a chance to win amazing prizes:</p>
        <ul>
          <li>First Prize: $${process.env.FIRST_PRIZE || 2000}</li>
          <li>Second Prize: $${process.env.SECOND_PRIZE || 1000}</li>
          <li>Third Prize: $${process.env.THIRD_PRIZE || 500}</li>
        </ul>
        <p>Best of luck!</p>
        <p>Best regards,<br>Lottery System Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // throw new Error('Failed to send welcome email');
  }
};
