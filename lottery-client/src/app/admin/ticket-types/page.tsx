'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { lotteryService } from '@/lib/lottery';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TicketType } from '@/types';
import toast from 'react-hot-toast';

export default function AdminTicketTypesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    color: '#3B82F6'
  });

  const fetchTicketTypes = useCallback(async () => {
    try {
      const response = await lotteryService.getTicketTypes(false); // Get all types including inactive
      setTicketTypes(response.ticketTypes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { status: number; data?: { message: string } } };
        if (axiosError.response?.status === 403) {
          toast.error('Admin access required');
          router.push('/dashboard');
        } else {
          toast.error(axiosError.response?.data?.message || 'Failed to load ticket types');
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

    fetchTicketTypes();
  }, [session, status, router, fetchTicketTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    try {
      if (editingType) {
        await lotteryService.updateTicketType(editingType.id, {
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          color: formData.color
        });
        toast.success('Ticket type updated successfully');
      } else {
        await lotteryService.createTicketType({
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          color: formData.color
        });
        toast.success('Ticket type created successfully');
      }
      
      setShowModal(false);
      setEditingType(null);
      setFormData({ name: '', description: '', price: '', color: '#3B82F6' });
      fetchTicketTypes();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to save ticket type');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleEdit = (ticketType: TicketType) => {
    setEditingType(ticketType);
    setFormData({
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price.toString(),
      color: ticketType.color
    });
    setShowModal(true);
  };

  const handleToggleActive = async (ticketType: TicketType) => {
    try {
      await lotteryService.updateTicketType(ticketType.id, {
        isActive: !ticketType.isActive
      });
      toast.success(`Ticket type ${ticketType.isActive ? 'deactivated' : 'activated'}`);
      fetchTicketTypes();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to update ticket type');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleDelete = async (ticketType: TicketType) => {
    if (!confirm(`Are you sure you want to delete "${ticketType.name}"?`)) {
      return;
    }

    try {
      await lotteryService.deleteTicketType(ticketType.id);
      toast.success('Ticket type deleted successfully');
      fetchTicketTypes();
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { error: string } } };
        toast.error(axiosError.response?.data?.error || 'Failed to delete ticket type');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading ticket types...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ticket Types Management</h1>
          <div className="flex space-x-4">
            <Button onClick={() => router.push('/admin')} variant="outline">
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ticket Type
            </Button>
          </div>
        </div>

        {/* Ticket Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="bg-gray-800 rounded-lg p-6 border-l-4" style={{ borderLeftColor: ticketType.color }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: ticketType.color }}>
                    {ticketType.name}
                  </h3>
                  {ticketType.description && (
                    <p className="text-gray-400 text-sm mb-2">{ticketType.description}</p>
                  )}
                  <p className="text-2xl font-bold">{formatCurrency(ticketType.price)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(ticketType)}
                    className={`p-2 rounded ${ticketType.isActive ? 'text-green-400' : 'text-gray-500'}`}
                    title={ticketType.isActive ? 'Active' : 'Inactive'}
                  >
                    {ticketType.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(ticketType)}
                    className="p-2 text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ticketType)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 space-y-1">
                <div>Status: {ticketType.isActive ? 'Active' : 'Inactive'}</div>
                <div>Created: {formatDate(ticketType.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {ticketTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl mb-4">No ticket types found</p>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Ticket Type
            </Button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingType ? 'Edit Ticket Type' : 'Create Ticket Type'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                  />
                </div>
                
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border border-gray-600"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingType ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingType(null);
                      setFormData({ name: '', description: '', price: '', color: '#3B82F6' });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}