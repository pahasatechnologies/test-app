'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Trophy, Users, DollarSign, RefreshCw, Coins } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { LotteryPool, Wallet, TclTokens } from '@/types';
import toast from 'react-hot-toast';

export default function LotteryPoolsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pools, setPools] = useState<LotteryPool[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tclTokens, setTclTokens] = useState<TclTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [poolsData, walletData, tokensData] = await Promise.all([
        lotteryService.getAvailablePools(),
        lotteryService.getWallet(),
        lotteryService.getUserTclTokens()
      ]);
      
      setPools(poolsData.pools);
      setWallet(walletData.wallet);
      setTclTokens(tokensData.tokens);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        console.error('Error fetching data:', axiosError);
        toast.error(axiosError.response?.data?.error || 'Failed to load lottery pools');
      } else {
        console.error('An unexpected error occurred:', error);
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !session.user) {
      router.push('/auth/login');
      return;
    }

    fetchData();
  }, [session, status, router, fetchData]);

  const handleJoinPool = async (poolType: string, entryFee: number) => {
    if (!wallet || wallet.balance < entryFee) {
      toast.error('Insufficient balance. Please add funds first.');
      return;
    }

    setJoining(poolType);
    try {
      const response = await lotteryService.joinPool(poolType);
      toast.success(response.message);
      
      // Refresh data
      await fetchData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to join pool');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading lottery pools...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">FIRST DECENTRALIZED CRYPTO LOTTERY</h1>
          <p className="text-xl text-gray-400 mb-6">
            80% Refundable • 10% Participation Fee • 10% Network Fee
          </p>
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">80% REFUND GUARANTEE</h2>
            <p className="text-teal-100">
              Get 80% of your entry fee back when winners are declared!
            </p>
          </div>
        </div>

        {/* Wallet & TCL Tokens Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              Wallet Balance
            </h3>
            <p className="text-3xl font-bold text-teal-400">
              {formatCurrency(wallet?.balance || 0)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => router.push('/wallet/deposit')}
            >
              Add Funds
            </Button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Coins className="w-6 h-6 mr-2" />
              TCL Tokens
            </h3>
            <p className="text-3xl font-bold text-yellow-400">
              {tclTokens?.balance.toFixed(0) || 0} TCL
            </p>
            <p className="text-sm text-gray-400 mt-2">
              1 TCL = $1 • Not withdrawable yet
            </p>
          </div>
        </div>

        {/* Lottery Pools */}
        <div className="grid lg:grid-cols-3 gap-8">
          {pools.map((pool) => (
            <div key={pool.id} className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-teal-500 transition-colors">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-teal-400 mb-2">
                  {formatCurrency(pool.entryFee)}
                </div>
                <div className="text-sm text-gray-400">Entry Fee</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Participants:</span>
                  <span>{pool.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Participants:</span>
                  <span className="text-teal-400">{pool.currentParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">80% Refund:</span>
                  <span className="text-green-400">{formatCurrency(pool.refundAmount)}</span>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h4 className="font-bold mb-3 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Prize Structure
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>🥇 1st Prize:</span>
                    <span className="text-yellow-400">{formatCurrency(pool.firstPrize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🥈 2nd Prize:</span>
                    <span className="text-gray-300">{formatCurrency(pool.secondPrize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🥉 3rd Prize:</span>
                    <span className="text-yellow-600">{formatCurrency(pool.thirdPrize)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <h4 className="font-bold mb-2 text-blue-300">Pool Instructions</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• High chance of winning with {pool.maxParticipants} participants</li>
                  <li>• 1st, 2nd, 3rd winners declared from each pool</li>
                  <li>• 80% refund when winner list is declared</li>
                  <li>• Automatic TCL tokens earned (1:1 ratio)</li>
                </ul>
              </div>

              <Button
                onClick={() => handleJoinPool(pool.poolType, pool.entryFee)}
                loading={joining === pool.poolType}
                disabled={!wallet || wallet.balance < pool.entryFee || pool.status !== 'active'}
                className="w-full"
                size="lg"
              >
                {!wallet || wallet.balance < pool.entryFee 
                  ? 'Insufficient Balance' 
                  : pool.status !== 'active'
                  ? 'Pool Not Available'
                  : `Join ${formatCurrency(pool.entryFee)} Pool`
                }
              </Button>

              <div className="mt-4 text-center">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(pool.currentParticipants / pool.maxParticipants) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {pool.currentParticipants} / {pool.maxParticipants} participants
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold mb-2">Choose Pool</h3>
              <p className="text-gray-400 text-sm">Select from $100, $500, or $1000 pools</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold mb-2">Join Pool</h3>
              <p className="text-gray-400 text-sm">Pay entry fee and earn TCL tokens</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold mb-2">Wait for Draw</h3>
              <p className="text-gray-400 text-sm">Draw happens when pool is full</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-bold mb-2">Get Results</h3>
              <p className="text-gray-400 text-sm">Win prizes or get 80% refund</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/lottery-pools/history')}
          >
            View My History
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/referrals')}
          >
            Referral Program
          </Button>
          <Button
            variant="outline"
            onClick={fetchData}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}