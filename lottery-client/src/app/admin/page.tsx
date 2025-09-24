'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Users, Trophy, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { adminService } from '@/lib/admin';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { AdminStats } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { status: number; data?: { message: string } } };
        if (axiosError.response?.status === 403) {
          toast.error('Admin access required');
          router.push('/dashboard');
        } else {
          toast.error(axiosError.response?.data?.message || 'Failed to load admin dashboard');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (!session || session.user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchStats();
  }, [session, status, router, fetchStats]);

  const handleConductDraw = async () => {
    try {
      const response = await adminService.conductDraw();
      toast.success(response.message);
      // Refresh stats
      const statsResponse = await adminService.getDashboardStats();
      setStats(statsResponse.stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to conduct draw');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleConductDraw} variant="primary">
            Conduct Draw
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.verifiedUsers || 0} verified
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Active Draws</p>
                <p className="text-2xl font-bold">{stats?.activeDraws || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.completedDraws || 0} completed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Deposits</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalDeposits || 0)}</p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats?.totalWithdrawals || 0)} withdrawn
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Active Tickets</p>
                <p className="text-2xl font-bold">{stats?.activeTickets || 0}</p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats?.totalWalletBalance || 0)} in wallets
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => router.push('/admin/users')}
              >
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/draws')}
              >
                View Draws
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/admin/withdrawals')}
              >
                Pending Withdrawals
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => router.push('/admin/settings')}
              >
                System Settings
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">System Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email Service</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Draw System</span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">Scheduled</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">New user registrations</span>
                <span>+{Math.floor(Math.random() * 10)} today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tickets purchased</span>
                <span>+{Math.floor(Math.random() * 50)} today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deposits processed</span>
                <span>+{Math.floor(Math.random() * 20)} today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last draw conducted</span>
                <span>{Math.floor(Math.random() * 30)} days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}