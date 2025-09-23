'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, DollarSign, Settings, Users, BarChart3, Wallet, ChevronDown } from 'lucide-react';
import { useAuth, authService } from '@/lib/auth';
import Button from '@/components/ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
  };

  // Regular navigation for all users
  const publicNavigation = [
    { name: 'HOME', href: '/' },
    { name: 'JACKPOT', href: '/jackpot' },
    { name: 'TICKETS', href: '/tickets' },
    { name: 'WINNERS', href: '/winners' },
    { name: 'FAQ', href: '/faq' },
    { name: 'ABOUT', href: '/about' },
  ];

  // Admin navigation items
  const adminNavigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard',
      icon: BarChart3,
      description: 'System overview and stats'
    },
    { 
      name: 'Users', 
      href: '/admin/users',
      icon: Users,
      description: 'Manage users and accounts'
    },
    { 
      name: 'Draws', 
      href: '/admin/draws',
      icon: Settings,
      description: 'Lottery draws management'
    },
    { 
      name: 'Withdrawals', 
      href: '/admin/withdrawals',
      icon: Wallet,
      description: 'Process withdrawal requests'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const isAdmin = user?.role === 'admin';
console.log("IIIIII", isAdmin, user)
  // Show loading state
  if (isLoading) {
    return (
      <header className="bg-gray-900 text-white">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              LOTTERY
            </Link>
            <div className="animate-pulse bg-gray-700 h-8 w-24 rounded"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold flex items-center hover:text-blue-400 transition-colors">
            <DollarSign className="h-6 w-6 mr-2" />
            CRYPTO LOTTERY
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Public Navigation */}
            {publicNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-blue-400 transition-colors text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}

            {/* Admin Dropdown (Only for Admins) */}
            {isAuthenticated && isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className="flex items-center space-x-1 hover:text-blue-400 transition-colors text-sm font-medium bg-gray-800 px-3 py-2 rounded-md"
                >
                  <Settings className="h-4 w-4" />
                  <span>ADMIN</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Admin Dropdown Menu */}
                {isAdminDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {adminNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <Icon className="h-5 w-5 mt-0.5 text-gray-500" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
                        onClick={() => setIsAdminDropdownOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4 text-gray-500" />
                        <span>Admin Panel</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {user?.role} {user?.isEmailVerified ? '✓' : '⚠️'}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                
                <Button 
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <div className="flex flex-col space-y-3 mt-4">
              {/* Public Navigation */}
              {publicNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:text-blue-400 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Navigation (Mobile) */}
              {isAuthenticated && isAdmin && (
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">
                    Admin Panel
                  </div>
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 py-2 hover:text-blue-400 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              
              {/* Mobile user actions */}
              <div className="border-t border-gray-700 pt-3 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="text-sm text-gray-300">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-400 capitalize">
                        {user?.role} Account {user?.isEmailVerified ? '(Verified)' : '(Unverified)'}
                      </div>
                    </div>
                    
                    <Link 
                      href="/dashboard" 
                      className="block text-blue-400 hover:text-blue-300 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-red-400 hover:text-red-300 py-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Click outside to close admin dropdown */}
      {isAdminDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsAdminDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
