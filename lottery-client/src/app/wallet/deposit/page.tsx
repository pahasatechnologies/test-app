'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Copy, CheckCircle } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Wallet } from '@/types';
import toast from 'react-hot-toast';

export default function DepositPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    transactionId: ''
  });
  const [copied, setCopied] = useState(false);

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

  const handleCopyAddress = async () => {
    if (wallet?.depositAddress) {
      try {
        await navigator.clipboard.writeText(wallet.depositAddress);
        setCopied(true);
        toast.success('Address copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error: unknown) {
        if (error instanceof Error) {
          const axiosError = error as { response?: { data?: { error: string } } };
          toast.error(axiosError.response?.data?.error || 'Failed to copy address');
        } else {
          toast.error('An unexpected error occurred');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.transactionId) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const response = await lotteryService.processDeposit(amount, formData.transactionId);
      toast.success(response.message);
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to process deposit');
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

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Deposit Funds</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Current Balance</h2>
          <p className="text-3xl font-bold text-teal-400">
            {formatCurrency(wallet?.balance || 0)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Deposit Address</h2>
          <p className="text-gray-400 mb-4">
            Send your cryptocurrency to this address. All users share the same deposit address.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm break-all mr-4">
                {wallet?.depositAddress}
              </p>
              <button
                onClick={handleCopyAddress}
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Important:</strong> After sending your deposit, please fill out the form below 
              with the transaction details to credit your account.
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Confirm Deposit</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Deposit Amount ($)"
              type="number"
              step="0.01"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter deposit amount"
              required
            />

            <Input
              label="Transaction ID"
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter transaction hash/ID"
              required
            />

            <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Referral Bonus:</strong> If someone referred you, they&apos;ll earn 10% of your deposit 
                as a referral bonus once your deposit is confirmed.
              </p>
            </div>

            <Button
              type="submit"
              loading={processing}
              className="w-full"
              size="lg"
            >
              Confirm Deposit
            </Button>
          </form>

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
    </div>
  );
}