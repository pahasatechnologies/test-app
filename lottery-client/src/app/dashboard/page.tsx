'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Ticket, Gift, Clock, Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { formatCurrency, formatCountdown, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Wallet as WalletType, Ticket as TicketType } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true);
    
    try {
      const [walletResponse, ticketsResponse] = await Promise.all([
        api.get('/wallet'),
        api.get('/tickets/my-tickets')
      ]);
      
      setWallet(walletResponse.data.wallet);
      setTickets(ticketsResponse.data.tickets);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading]);

  const handleRefresh = () => {
    fetchData(true);
  };

  // Show loading state while checking auth or loading data
  if (isLoading || loading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">
            {!isAuthenticated && !isLoading ? 'Redirecting to login...' : 'Loading dashboard...'}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const activeTickets = tickets.filter(t => t.status === 'active');
  const winningTickets = tickets.filter(t => t.status === 'winner' || (t as any).isWinner);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Account Information</h2>
              <div className="space-y-1 text-blue-100">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Username:</span> {user?.username}</p>
                <p><span className="font-medium">Role:</span> {user?.role?.toUpperCase()}</p>
                <p><span className="font-medium">Referral Code:</span> <span className="font-mono bg-blue-500/30 px-2 py-1 rounded">{user?.referralCode}</span></p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                user?.isEmailVerified 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {user?.isEmailVerified ? '✓ Verified' : '⚠️ Unverified'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-teal-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Wallet Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Ticket className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Active Tickets</p>
                <p className="text-2xl font-bold">{activeTickets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Winnings</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(winningTickets.reduce((sum, t) => sum + ((t as any).prizeWon || 0), 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Referral Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(wallet?.referralEarnings || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Warning */}
        {!user?.isEmailVerified && (
          <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-red-300">⚠️ Email Not Verified</h3>
                <p className="text-red-200">Please verify your email to access all features and ensure account security.</p>
              </div>
              <Button 
                variant="primary"
                onClick={() => router.push('/auth/verify')}
              >
                Verify Email
              </Button>
            </div>
          </div>
        )}

        {/* Surprise Feature */}
        {wallet?.surpriseActivated && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🎉 Surprise Feature Activated!</h3>
                <p className="text-purple-100">You've made 5+ deposits and unlocked special rewards!</p>
              </div>
              <Button variant="secondary">
                Claim Surprise
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Wallet Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Wallet className="w-6 h-6 mr-2" />
              Wallet Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Balance:</span>
                <span className="font-semibold text-green-400">{formatCurrency(wallet?.balance || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Deposited:</span>
                <span>{formatCurrency(wallet?.totalDeposited || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Withdrawn:</span>
                <span>{formatCurrency(wallet?.totalWithdrawn || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Withdrawal:</span>
                <span className="text-yellow-400">{formatCurrency(wallet?.maxWithdrawalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deposit Count:</span>
                <span className="text-blue-400">{wallet?.depositCount || 0}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                className="w-full" 
                onClick={() => router.push('/wallet/deposit')}
              >
                Deposit Funds
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/wallet/withdraw')}
                disabled={(wallet?.maxWithdrawalAmount || 0) <= 0}
              >
                Withdraw Funds {(wallet?.maxWithdrawalAmount || 0) <= 0 && '(No funds available)'}
              </Button>
            </div>

            {wallet?.depositAddress && (
              <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
                <p className="text-gray-400 mb-1">Deposit Address:</p>
                <p className="font-mono text-xs break-all text-green-400">{wallet.depositAddress}</p>
              </div>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Ticket className="w-6 h-6 mr-2" />
                Recent Tickets
              </div>
              <span className="text-sm text-gray-400">({tickets.length} total)</span>
            </h2>

            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No tickets yet</p>
                <p className="text-sm text-gray-500 mb-4">Start by purchasing your first lottery ticket!</p>
                <Button onClick={() => router.push('/tickets')}>
                  Buy Your First Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono text-sm text-blue-400">{ticket.ticketNumber}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(ticket.purchasedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(ticket.purchasePrice)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ticket.status === 'active' ? 'bg-green-600/20 text-green-400 border border-green-500/30' :
                          ticket.status === 'winner' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {ticket.status === 'active' && (ticket as any).draw?.daysRemaining && (
                      <div className="flex items-center text-sm text-teal-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatCountdown((ticket as any).draw.daysRemaining)} remaining
                      </div>
                    )}
                    
                    {((ticket as any).isWinner || ticket.status === 'winner') && (
                      <div className="text-yellow-400 font-bold flex items-center">
                        <Trophy className="w-4 h-4 mr-1" />
                        Won {formatCurrency((ticket as any).prizeWon || 0)}!
                      </div>
                    )}
                  </div>
                ))}

                {tickets.length > 5 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400">
                      Showing 5 of {tickets.length} tickets
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => router.push('/tickets')}>
                {tickets.length === 0 ? 'Buy Tickets' : 'View All Tickets'}
              </Button>
              {tickets.length > 0 && (
                <Button variant="secondary" className="w-full" onClick={() => router.push('/tickets/buy')}>
                  Buy More Tickets
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => router.push('/tickets')} className="flex flex-col items-center py-4">
              <Ticket className="w-6 h-6 mb-2" />
              <span>Buy Tickets</span>
            </Button>
            <Button variant="outline" onClick={() => router.push('/wallet')} className="flex flex-col items-center py-4">
              <Wallet className="w-6 h-6 mb-2" />
              <span>Manage Wallet</span>
            </Button>
            <Button variant="outline" onClick={() => router.push('/history')} className="flex flex-col items-center py-4">
              <Trophy className="w-6 h-6 mb-2" />
              <span>Win History</span>
            </Button>
            <Button variant="outline" onClick={() => router.push('/referrals')} className="flex flex-col items-center py-4">
              <Gift className="w-6 h-6 mb-2" />
              <span>Referrals</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
