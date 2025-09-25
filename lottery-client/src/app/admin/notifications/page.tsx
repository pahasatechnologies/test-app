'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Send, Bell, Users, MessageSquare } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Notification } from '@/types';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });

  // Quick templates
  const templates = [
    {
      name: 'System Maintenance',
      title: 'Scheduled Maintenance',
      message: 'The system will be under maintenance from 2:00 AM to 4:00 AM UTC. Please plan accordingly.',
      type: 'warning' as const
    },
    {
      name: 'New Feature',
      title: 'New Feature Available!',
      message: 'We\'ve added exciting new features to enhance your lottery experience. Check them out!',
      type: 'success' as const
    },
    {
      name: 'Draw Reminder',
      title: 'Draw Ending Soon',
      message: 'The current lottery draw will end in 24 hours. Don\'t miss your chance to win!',
      type: 'info' as const
    },
    {
      name: 'Security Alert',
      title: 'Security Update',
      message: 'We\'ve implemented additional security measures to protect your account. Please review your settings.',
      type: 'warning' as const
    }
  ];

  const fetchNotifications = useCallback(async () => {
    try {
      // This would be an admin endpoint to get all notifications
      // For now, we'll just show the form
      setLoading(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { status: number; data?: { message: string } } };
        if (axiosError.response?.status === 403) {
          toast.error('Admin access required');
          router.push('/dashboard');
        } else {
          toast.error(axiosError.response?.data?.message || 'Failed to load notifications');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchNotifications();
  }, [session, status, router, fetchNotifications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    setSending(true);
    try {
      await lotteryService.sendGlobalNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type
      });
      
      toast.success('Global notification sent successfully');
      setFormData({ title: '', message: '', type: 'info' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to send notification');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setFormData({
      title: template.title,
      message: template.message,
      type: template.type
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Send Notifications</h1>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Send Notification Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Send className="w-6 h-6 mr-2" />
              Send Global Notification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter notification title"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={4}
                  placeholder="Enter notification message"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              {/* Preview */}
              {(formData.title || formData.message) && (
                <div className="border border-gray-600 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Preview:</h3>
                  <div className={`p-3 rounded border ${getTypeColor(formData.type)}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{getTypeIcon(formData.type)}</span>
                      <div>
                        <h4 className="font-medium">{formData.title}</h4>
                        <p className="text-sm mt-1">{formData.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={sending}
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to All Users
              </Button>
            </form>
          </div>

          {/* Templates */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              Quick Templates
            </h2>

            <div className="space-y-4">
              {templates.map((template, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{template.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{template.message}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Notification Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Users:</span>
                  <span>Loading...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Sent:</span>
                  <span>-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3 text-blue-300">📢 How Global Notifications Work</h3>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li>• Global notifications are sent to all registered users</li>
            <li>• Users will see them in their notification bell in the header</li>
            <li>• Choose the appropriate type (info, success, warning, error) for proper styling</li>
            <li>• Keep messages clear and concise for better user experience</li>
            <li>• Use templates for common notification scenarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}