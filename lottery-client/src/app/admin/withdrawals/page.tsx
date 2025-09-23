'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, User, Wallet } from 'lucide-react';
import { adminService } from '@/lib/admin';
import { authService } from '@/lib/auth';
import { formatCurrency, formatDate, truncateAddress } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { PendingWithdrawal } from '@/types';
import toast from 'react-hot-toast';

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Client-side authentication check, falls back to login if not authenticated
    if (!authService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    fetchWithdrawals();
  }, [router]);

  const fetchWithdrawals = async () => {
    try {
      const response = await adminService.getPendingWithdrawals();
      setWithdrawals(response.withdrawals);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        router.push('/dashboard');
      } else {
        toast.error('Failed to load withdrawals');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setProcessing(withdrawalId);
    try {
      const response = await adminService.processWithdrawal(withdrawalId, action);
      toast.success(response.message);
      
      // Remove processed withdrawal from list
      setWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${action} withdrawal`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading withdrawals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pending Withdrawals</h1>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {withdrawals.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Pending Withdrawals</h2>
            <p className="text-gray-400">All withdrawal requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="bg-gray-800 rounded-lg p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* User Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      User Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Name: </span>
                        <span>{withdrawal.user.fullName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email: </span>
                        <span>{withdrawal.user.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Username: </span>
                        <span>@{withdrawal.user.username}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested: </span>
                        <span>{formatDate(withdrawal.requestedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Withdrawal Details */}
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <Wallet className="w-5 h-5 mr-2" />
                      Withdrawal Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Amount: </span>
                        <span className="text-2xl font-bold text-teal-400">
                          {formatCurrency(withdrawal.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Wallet Address: </span>
                        <span className="font-mono text-xs break-all">
                          {withdrawal.walletAddress}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status: </span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {withdrawal.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Actions</h3>
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleProcessWithdrawal(withdrawal.id, 'approve')}
                        loading={processing === withdrawal.id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Withdrawal
                      </Button>
                      
                      <Button
                        onClick={() => handleProcessWithdrawal(withdrawal.id, 'reject')}
                        loading={processing === withdrawal.id}
                        variant="outline"
                        className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Withdrawal
                      </Button>
                    </div>

                    <div className="mt-4 p-3 bg-gray-700 rounded text-xs">
                      <p className="text-gray-400 mb-1">Withdrawal ID:</p>
                      <p className="font-mono">{withdrawal.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}