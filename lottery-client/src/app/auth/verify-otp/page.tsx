'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/auth/signup');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authService.verifyOTP(email, otp);
      toast.success(response.message);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await authService.resendOTP(email);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            We've sent a 6-digit code to {email}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Enter OTP"
            name="otp"
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError('');
            }}
            error={error}
            className="bg-gray-800 border-gray-700 text-white text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Verify Email
          </Button>

          <div className="text-center">
            <span className="text-gray-400">Didn't receive the code? </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-teal-400 hover:text-teal-300 disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}