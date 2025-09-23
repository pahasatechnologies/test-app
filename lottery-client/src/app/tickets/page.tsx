'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Clock, Trophy } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency, formatCountdown } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { TicketInfo, Wallet } from '@/types';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [ticketData, walletData] = await Promise.all([
        lotteryService.getTicketInfo(),
        lotteryService.getWallet()
      ]);
      
      setTicketInfo(ticketData);
      setWallet(walletData.wallet);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        console.error('Error fetching data:', axiosError);
        toast.error(axiosError.response?.data?.error || 'Failed to load ticket information');
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

    fetchData();
  }, [session, status, router, fetchData]);

  const handlePurchase = async () => {
    if (!wallet || !ticketInfo) return;

    const totalCost = ticketInfo.ticketPrice * quantity;
    
    if (wallet.balance < totalCost) {
      toast.error('Insufficient balance. Please deposit funds first.');
      return;
    }

    setPurchasing(true);
    try {
      const purchaseResponse = await lotteryService.purchaseTicket(quantity);
      toast.success(purchaseResponse.message || `Successfully purchased ${quantity} ticket(s)!`);
      
      // Refresh wallet data
      const walletData = await lotteryService.getWallet();
      setWallet(walletData.wallet);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to purchase tickets');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tickets...</div>
      </div>
    );
  }

  const totalCost = (ticketInfo?.ticketPrice || 0) * quantity;
  const canPurchase = wallet && wallet.balance >= totalCost;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Buy Lottery Tickets</h1>

        {/* Current Draw Info */}
        {ticketInfo?.currentDraw && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Current Draw</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Tickets Sold:</span>
                    <span>{ticketInfo.currentDraw.totalTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Pool:</span>
                    <span>{formatCurrency(ticketInfo.currentDraw.prizePool)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Remaining:</span>
                    <span className="text-teal-400 font-mono">
                      {formatCountdown(ticketInfo.currentDraw.daysRemaining)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Prize Structure</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-yellow-400">🥇 First Prize:</span>
                    <span>{formatCurrency(ticketInfo.prizes.first)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">🥈 Second Prize:</span>
                    <span>{formatCurrency(ticketInfo.prizes.second)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">🥉 Third Prize:</span>
                    <span>{formatCurrency(ticketInfo.prizes.third)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ticket Purchase */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-2" />
              Purchase Tickets
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-1">Maximum 100 tickets per purchase</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Price per ticket:</span>
                  <span>{formatCurrency(ticketInfo?.ticketPrice || 0)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-bold">Total Cost:</span>
                  <span className="font-bold text-xl">{formatCurrency(totalCost)}</span>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                loading={purchasing}
                disabled={!canPurchase}
                className="w-full"
                size="lg"
              >
                {!canPurchase ? 'Insufficient Balance' : `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </Button>

              {!canPurchase && wallet && (
                <div className="text-center">
                  <p className="text-red-400 text-sm mb-2">
                    You need {formatCurrency(totalCost - wallet.balance)} more
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/wallet/deposit')}
                  >
                    Deposit Funds
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Your Wallet</h2>
            
            {wallet ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-2xl font-bold">{formatCurrency(wallet.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Deposited:</span>
                  <span>{formatCurrency(wallet.totalDeposited)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Referral Earnings:</span>
                  <span>{formatCurrency(wallet.referralEarnings)}</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={() => router.push('/wallet/deposit')}
                  >
                    Deposit Funds
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push('/dashboard')}
                  >
                    View Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading wallet information...</p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">1. Buy Tickets</h3>
              <p className="text-gray-400 text-sm">Purchase lottery tickets for ${ticketInfo?.ticketPrice || 100} each</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">2. Wait for Draw</h3>
              <p className="text-gray-400 text-sm">Draws happen every 30 days with countdown timer</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">3. Win Prizes</h3>
              <p className="text-gray-400 text-sm">Winners selected fairly from different countries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}