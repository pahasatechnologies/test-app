'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    location: '',
    password: '',
    confirmPassword: '',
    referredBy: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.signup(formData);
      toast.success(response.message);
      router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join the crypto lottery revolution
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="First Name *"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            
            <Input
              label="Last Name *"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            
            <Input
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            
            <Input
              label="Username *"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            
            <Input
              label="Mobile Number (Required if you win)"
              name="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter your mobile number"
            />
            
            <Input
              label="Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            
            <Input
              label="Re-enter Password *"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            
            <Input
              label="Referral Code (Optional)"
              name="referredBy"
              type="text"
              value={formData.referredBy}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter referral code"
            />
            
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                className="mt-1"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-300">
                I agree to the <a href="/terms" className="text-teal-400 hover:text-teal-300">Terms & Conditions</a> and <a href="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</a> *
              </label>
            </div>
            {errors.agreeTerms && <p className="text-red-400 text-sm">{errors.agreeTerms}</p>}
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Create Account
          </Button>

          <div className="text-center">
            <span className="text-gray-400">Already have an account? </span>
            <Link href="/auth/login" className="text-teal-400 hover:text-teal-300">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}