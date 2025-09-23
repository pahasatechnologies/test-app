'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertTriangle } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Wallet } from '@/types';
import toast from 'react-hot-toast';

export default function WithdrawPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    walletAddress: '',
    amount: ''
  });

  const fetchWallet = useCallback(async () => {
    try {
      const walletData = await lotteryService.getWallet();
      setWallet(walletData.wallet);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        console.error('Error fetching wallet:', axiosError);
        toast.error(axiosError.response?.data?.error || 'Failed to load wallet information');
      } else {
        console.error('An unexpected error occurred:', error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (!session || !session.user) {
      router.push('/auth/login');
      return;
    }

    fetchWallet();
  }, [session, status, router, fetchWallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.walletAddress || !formData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (wallet && amount > wallet.maxWithdrawalAmount) {
      toast.error(`Maximum withdrawal amount is ${formatCurrency(wallet.maxWithdrawalAmount)}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await lotteryService.requestWithdrawal(
        formData.fullName,
        formData.walletAddress,
        amount
      );
      toast.success(response.message);
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to request withdrawal');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet...</div>
      </div>
    );
  }

  const maxWithdrawal = wallet?.maxWithdrawalAmount || 0;
  const canWithdraw = maxWithdrawal > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Withdraw Funds</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Withdrawal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Current Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <div>
              <p className="text-gray-400">Max Withdrawal</p>
              <p className="text-2xl font-bold text-teal-400">{formatCurrency(maxWithdrawal)}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Deposited</p>
              <p className="font-bold">{formatCurrency(wallet?.totalDeposited || 0)}</p>
            </div>
            <div>
              <p className="text-gray-400">Referral Earnings</p>
              <p className="font-bold">{formatCurrency(wallet?.referralEarnings || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-200 mb-2">Withdrawal Formula</h3>
              <p className="text-yellow-200 text-sm">
                Available Amount = Total Deposited - Referral Earnings - 10% Fee
              </p>
              <p className="text-yellow-200 text-sm mt-2">
                <strong>Note:</strong> Withdrawals are only available after winner declaration (every 30 days).
              </p>
            </div>
          </div>
        </div>

        {!canWithdraw ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Withdrawal Not Available</h2>
            <p className="text-gray-400 mb-6">
              You currently have no funds available for withdrawal. This could be because:
            </p>
            <ul className="text-left text-gray-400 mb-6 space-y-2">
              <li>• You haven&apos;t made any deposits yet</li>
              <li>• The current draw is still active (withdrawals available after winner declaration)</li>
              <li>• Your referral earnings exceed your deposits</li>
            </ul>
            <Button
              variant="outline"
              onClick={() => router.push('/wallet/deposit')}
            >
              Make a Deposit
            </Button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Withdrawal Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Withdrawal Wallet Address"
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your wallet address"
                required
              />

              <Input
                label={`Withdrawal Amount (Max: ${formatCurrency(maxWithdrawal)})`}
                type="number"
                step="0.01"
                min="1"
                max={maxWithdrawal}
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter withdrawal amount"
                required
              />

              <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  <strong>Processing Time:</strong> Withdrawal requests are typically processed within 24-48 hours. 
                  You will receive a confirmation once your withdrawal has been sent.
                </p>
              </div>

              <Button
                type="submit"
                loading={processing}
                className="w-full"
                size="lg"
              >
                Request Withdrawal
              </Button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}