'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency, formatDate, truncateAddress } from '@/lib/utils';
import { DrawHistory } from '@/types';

export default function WinnersPage() {
  const [draws, setDraws] = useState<DrawHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const response = await lotteryService.getDrawHistory(page, 10);
        setDraws(response.draws.filter(draw => draw.status === 'completed'));
        setTotalPages(response.pagination.pages);
      } catch (error) {
        console.error('Error fetching draw history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading winners...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Past Winners</h1>
          <p className="text-xl text-gray-400">
            Celebrating our lottery champions from around the world
          </p>
        </div>

        {draws.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Winners Yet</h2>
            <p className="text-gray-400">Be the first to win our lottery!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {draws.map((draw) => (
              <div key={draw.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Draw #{draw.id.slice(-8)}
                    </h2>
                    <div className="flex items-center space-x-6 text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(draw.endDate)}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {draw.totalTickets} tickets sold
                      </div>
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        {formatCurrency(draw.prizePool)} prize pool
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* First Prize */}
                  {draw.winners.first && (
                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">🥇</div>
                      <h3 className="text-xl font-bold mb-2">First Prize</h3>
                      <p className="text-2xl font-bold mb-2">
                        {formatCurrency(draw.winners.first.prize)}
                      </p>
                      <p className="text-yellow-100 text-sm">
                        Ticket: {draw.winners.first.ticketNumber}
                      </p>
                      <p className="text-yellow-200 font-medium">
                        {draw.winners.first.name}
                      </p>
                    </div>
                  )}

                  {/* Second Prize */}
                  {draw.winners.second && (
                    <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">🥈</div>
                      <h3 className="text-xl font-bold mb-2">Second Prize</h3>
                      <p className="text-2xl font-bold mb-2">
                        {formatCurrency(draw.winners.second.prize)}
                      </p>
                      <p className="text-gray-100 text-sm">
                        Ticket: {draw.winners.second.ticketNumber}
                      </p>
                      <p className="text-gray-200 font-medium">
                        {draw.winners.second.name}
                      </p>
                    </div>
                  )}

                  {/* Third Prize */}
                  {draw.winners.third && (
                    <div className="bg-gradient-to-br from-yellow-700 to-yellow-800 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">🥉</div>
                      <h3 className="text-xl font-bold mb-2">Third Prize</h3>
                      <p className="text-2xl font-bold mb-2">
                        {formatCurrency(draw.winners.third.prize)}
                      </p>
                      <p className="text-yellow-100 text-sm">
                        Ticket: {draw.winners.third.ticketNumber}
                      </p>
                      <p className="text-yellow-200 font-medium">
                        {draw.winners.third.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 bg-teal-600 rounded-lg">
              {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}