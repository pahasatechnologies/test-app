'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { adminService } from '@/lib/admin';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminDrawsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [draws, setDraws] = useState<any[]>([]);
  const [conducting, setConducting] = useState(false);

  const loadDraws = useCallback(async () => {
    try {
      const response = await adminService.getAllDraws();
      setDraws(response.draws || []);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to load draws');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    loadDraws();
  }, [session, status, router, loadDraws]);

  const handleConductDraw = async () => {
    try {
      setConducting(true);
      const response = await adminService.conductDraw();
      toast.success(response.message || 'Draw conducted');
      await loadDraws();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to conduct draw');
    } finally {
      setConducting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading draws...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Draws</h1>
          <Button onClick={handleConductDraw} disabled={conducting}>
            {conducting ? 'Conducting...' : 'Conduct New Draw'}
          </Button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-6 px-4 py-3 text-sm text-gray-400 border-b border-gray-700">
            <div>ID</div>
            <div>Status</div>
            <div>Prize Pool</div>
            <div>Total Tickets</div>
            <div>Created</div>
            <div>Completed</div>
          </div>
          {draws.length === 0 ? (
            <div className="p-6 text-gray-400">No draws found.</div>
          ) : (
            draws.map((draw) => (
              <div key={draw.id} className="grid grid-cols-6 px-4 py-3 border-b border-gray-800 text-sm">
                <div className="truncate" title={draw.id}>{draw.id}</div>
                <div className="capitalize">{draw.status}</div>
                <div>{Number(draw.prizePool).toLocaleString()}</div>
                <div>{draw.totalTickets ?? draw._count?.tickets ?? 0}</div>
                <div>{draw.createdAt ? new Date(draw.createdAt).toLocaleString() : '-'}</div>
                <div>{draw.completedAt ? new Date(draw.completedAt).toLocaleString() : '-'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


