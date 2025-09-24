'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { adminService } from '@/lib/admin';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

type ConfigItem = {
  key: string;
  value: string;
  description?: string;
  category?: string;
  isEditable?: boolean;
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  const filteredConfigs = useMemo(() => {
    if (!filter) return configs;
    const f = filter.toLowerCase();
    return configs.filter(c => c.key.toLowerCase().includes(f) || (c.description || '').toLowerCase().includes(f));
  }, [configs, filter]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    (async () => {
      try {
        const { configs } = await adminService.getSystemConfigs();
        setConfigs(configs || []);
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to load configurations');
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  const handleSave = async (item: ConfigItem, newValue: string) => {
    try {
      setSavingKey(item.key);
      const res = await adminService.updateSystemConfig(item.key, newValue);
      toast.success(res.message || 'Configuration updated');
      setConfigs(prev => prev.map(c => (c.key === item.key ? { ...c, value: newValue } : c)));
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to update configuration');
    } finally {
      setSavingKey(null);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      const res = await adminService.initializeDefaultConfigs();
      toast.success(res.message || 'Defaults initialized');
      const { configs } = await adminService.getSystemConfigs();
      setConfigs(configs || []);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to initialize defaults');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  const categories = Array.from(new Set(configs.map(c => c.category || 'general')));

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">System Settings</h1>
          <Button variant="outline" onClick={handleInitializeDefaults}>Initialize Defaults</Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by key or description"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold mb-3 capitalize text-gray-300">{cat}</h2>
            <div className="bg-gray-800 rounded-lg divide-y divide-gray-700">
              {filteredConfigs.filter(c => (c.category || 'general') === cat).map((item) => (
                <div key={item.key} className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                  <div className="md:col-span-2">
                    <div className="font-medium">{item.key}</div>
                    {item.description && (
                      <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <input
                      defaultValue={item.value}
                      disabled={item.isEditable === false}
                      onBlur={(e) => {
                        const newValue = e.target.value;
                        if (newValue !== item.value && item.isEditable !== false) {
                          handleSave(item, newValue);
                        }
                      }}
                      className={`w-full bg-gray-900 border ${item.isEditable === false ? 'border-gray-800 text-gray-500' : 'border-gray-700'} rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={savingKey === item.key || item.isEditable === false}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        const container = (e.currentTarget.closest('.p-4') as HTMLElement);
                        const input = container?.querySelector('input') as HTMLInputElement | null;
                        if (input && input.value !== item.value && item.isEditable !== false) {
                          handleSave(item, input.value);
                        }
                      }}
                    >
                      {savingKey === item.key ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


