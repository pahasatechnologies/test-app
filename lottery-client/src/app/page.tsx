'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Brain, Shield } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency, formatCountdown } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { TicketInfo, DrawHistory } from '@/types';

export default function HomePage() {
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [pastWinners, setPastWinners] = useState<DrawHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketData, winnersData] = await Promise.all([
          lotteryService.getTicketInfo(),
          lotteryService.getDrawHistory(1, 3)
        ]);
        
        setTicketInfo(ticketData);
        setPastWinners(winnersData.draws.filter(draw => draw.status === 'completed'));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentJackpot = ticketInfo?.currentDraw?.prizePool || 9500;
  const countdown = ticketInfo?.currentDraw ? formatCountdown(ticketInfo.currentDraw.daysRemaining) : '3D : 16H : 12M';

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Play Weekly.<br />
                Get 90% Back.<br />
                Win Big.
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                A refund-first crypto lottery<br />
                with provable fairness.
              </p>
              <Link href="/tickets">
                <Button size="lg" className="px-8 py-4 text-lg">
                  BUY TICKET
                </Button>
              </Link>
            </div>

            {/* Right Content - Jackpot */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full border-4 border-teal-500 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">JACKPOT</div>
                    <div className="text-4xl font-bold text-gray-900">
                      {formatCurrency(currentJackpot)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-4xl font-mono text-teal-400">
                {countdown}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">PROVABLY FAIR</h3>
              <p className="text-gray-400">Transparent and verifiable lottery system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">SMART CONTRACTS</h3>
              <p className="text-gray-400">Automated and secure prize distribution</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">REFUND GUARANTEE</h3>
              <p className="text-gray-400">Get 90% back if you don't win</p>
            </div>
          </div>
        </div>
      </section>

      {/* Past Winners Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">PAST WINNERS</h2>
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="space-y-6">
              {pastWinners.slice(0, 3).map((draw, index) => {
                const prizes = [
                  { place: '1ST', winner: draw.winners.first, color: 'text-yellow-400' },
                  { place: '2ND', winner: draw.winners.second, color: 'text-gray-300' },
                  { place: '3RD', winner: draw.winners.third, color: 'text-yellow-600' }
                ];

                return prizes.map((prize) => 
                  prize.winner ? (
                    <div key={`${draw.id}-${prize.place}`} className="flex justify-between items-center py-4 border-b border-gray-700">
                      <div className="flex items-center space-x-4">
                        <span className={`text-lg font-bold ${prize.color}`}>{prize.place}</span>
                        <span className="text-gray-300">{prize.winner.ticketNumber}</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-400">
                        {formatCurrency(prize.winner.prize)}
                      </span>
                    </div>
                  ) : null
                );
              }).flat().filter(Boolean)}
              
              {pastWinners.length === 0 && (
                <div className="text-center text-gray-400">
                  No winners yet. Be the first!
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}