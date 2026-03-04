'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Trophy, Clock, RefreshCw, ArrowLeft, Coins } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { PoolParticipation, RefundTransaction, TclTokens } from '@/types';
import toast from 'react-hot-toast';

export default function LotteryPoolHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<PoolParticipation[]>([]);
  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [tclTokens, setTclTokens] = useState<TclTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'refunds' | 'tokens'>('history');

  const fetchData = useCallback(async () => {
    try {
      const [historyData, refundsData, tokensData] = await Promise.all([
        lotteryService.getUserPoolHistory(),
        lotteryService.getUserRefunds(),
        lotteryService.getUserTclTokens()
      ]);
      
      setHistory(historyData.history);
      setRefunds(refundsData.refunds);
      setTclTokens(tokensData.tokens);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        console.error('Error fetching data:', axiosError);
        toast.error(axiosError.response?.data?.error || 'Failed to load history');
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

  const getStatusColor = (status: string, isWinner: boolean) => {
    if (isWinner) return 'text-yellow-400';
    if (status === 'completed') return 'text-green-400';
    if (status === 'active') return 'text-blue-400';
    return 'text-gray-400';
  };

  const getStatusText = (participation: PoolParticipation) => {
    if (participation.isWinner) return 'Winner! 🎉';
    if (participation.pool.status === 'completed') return 'Completed';
    if (participation.pool.status === 'active') return 'Active';
    return participation.pool.status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/lottery-pools')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pools
            </Button>
            <h1 className="text-3xl font-bold">My Lottery History</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pool History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'refunds'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Refunds ({refunds.length})
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TCL Tokens
          </button>
        </div>

        {/* Pool History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Pool History</h2>
                <p className="text-gray-400 mb-6">You haven't joined any lottery pools yet.</p>
                <Button onClick={() => router.push('/lottery-pools')}>
                  Join Your First Pool
                </Button>
              </div>
            ) : (
              history.map((participation) => (
                <div key={participation.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {formatCurrency(participation.pool.entryFee)} Pool
                      </h3>
                      <p className="text-gray-400">
                        Joined on {formatDate(participation.joinedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getStatusColor(participation.pool.status, participation.isWinner)}`}>
                        {getStatusText(participation)}
                      </span>
                      {participation.pool.completedAt && (
                        <p className="text-sm text-gray-400">
                          Completed: {formatDate(participation.pool.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Entry Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entry Fee:</span>
                          <span>{formatCurrency(participation.entryAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Participation Fee:</span>
                          <span>{formatCurrency(participation.participationFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network Fee:</span>
                          <span>{formatCurrency(participation.networkFee)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Results</h4>
                      {participation.isWinner ? (
                        <div className="text-yellow-400">
                          <div className="flex items-center mb-2">
                            <Trophy className="w-4 h-4 mr-2" />
                            <span className="font-bold">Winner!</span>
                          </div>
                          <p className="text-2xl font-bold">
                            {formatCurrency(participation.prizeWon)}
                          </p>
                        </div>
                      ) : participation.pool.status === 'completed' ? (
                        <div className="text-green-400">
                          <p className="text-sm mb-1">80% Refund</p>
                          <p className="font-bold">
                            {formatCurrency(participation.entryAmount * 0.8)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-blue-400">
                          <Clock className="w-4 h-4 mb-2" />
                          <p className="text-sm">Waiting for draw...</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium mb-2">TCL Tokens Earned</h4>
                      <div className="flex items-center text-yellow-400">
                        <Coins className="w-4 h-4 mr-2" />
                        <span className="text-xl font-bold">
                          {participation.entryAmount} TCL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            {refunds.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💰</div>
                <h2 className="text-2xl font-bold mb-2">No Refunds Yet</h2>
                <p className="text-gray-400">Refunds will appear here after pool draws are completed.</p>
              </div>
            ) : (
              refunds.map((refund) => (
                <div key={refund.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        {formatCurrency(refund.pool.entryFee)} Pool Refund
                      </h3>
                      <p className="text-gray-400">
                        {formatDate(refund.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(refund.refundAmount)}
                      </p>
                      <span className={`text-sm px-2 py-1 rounded ${
                        refund.status === 'completed' 
                          ? 'bg-green-600 text-green-100' 
                          : 'bg-yellow-600 text-yellow-100'
                      }`}>
                        {refund.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TCL Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="bg-gray-800 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">TCL Token Balance</h2>
              <p className="text-gray-400">The Crypto Lottery Tokens</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-400 mb-2">Current Balance</h3>
                <p className="text-4xl font-bold text-yellow-400">
                  {tclTokens?.balance.toFixed(0) || 0} TCL
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-400 mb-2">Total Earned</h3>
                <p className="text-4xl font-bold text-yellow-400">
                  {tclTokens?.totalEarned.toFixed(0) || 0} TCL
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-blue-300">About TCL Tokens</h3>
              <ul className="space-y-2 text-blue-200">
                <li>• 1 TCL Token = $1 USD (Presale Rate)</li>
                <li>• Automatically earned when joining lottery pools</li>
                <li>• Currently not withdrawable</li>
                <li>• Future utility and trading features coming soon</li>
                <li>• Tokens represent your participation in the ecosystem</li>
              </ul>
            </div>

            {!tclTokens?.isWithdrawable && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                  <span className="text-yellow-300">🔒 Withdrawal not available yet</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}