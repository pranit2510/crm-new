'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Bell as BellIcon,
  UserCircle as UserCircleIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Zap,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // User is now provided by AuthContext, no need for local state

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const toggleMobileMenu = () => {
    // Emit event for sidebar to listen to
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement global search functionality
      console.log('Searching for:', searchQuery);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setUserDropdownOpen(false);
    try {
      await logout();
      // Add a small delay for better UX, then redirect
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className='bg-white text-dark shadow-md sticky top-0 z-50 transition-all duration-200'>
      <div className='container mx-auto px-4 h-16 flex justify-between items-center'>
        {/* Left side: Hamburger Menu (mobile) & App Name/Logo */}
        <div className='flex items-center'>
          <button
            onClick={toggleMobileMenu}
            className='md:hidden mr-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 active:scale-95'
            aria-label='Open navigation menu'
          >
            <MenuIcon className='h-6 w-6 text-gray-600' />
          </button>
          <Link href="/" className='flex items-center text-xl font-bold text-primary group'>
            <Zap size={24} className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">VoltFlow CRM</span>
            <span className="sm:hidden">VoltFlow</span>
          </Link>
        </div>

        {/* Middle: Global Search Bar */}
        <div className='hidden md:flex flex-1 max-w-md mx-4'>
          <form onSubmit={handleSearch} className='relative w-full'>
            <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='search'
              placeholder='Search clients, jobs, invoices...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200'
            />
          </form>
        </div>

        {/* Right side: Icons & User Menu */}
        <div className='flex items-center space-x-2 sm:space-x-4'>
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className='md:hidden p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 active:scale-95'
            aria-label='Toggle search'
          >
            {searchOpen ? <X size={20} /> : <SearchIcon size={20} />}
          </button>

          {/* Notifications */}
          <button
            className='relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 active:scale-95 group'
            aria-label='View notifications'
          >
            <BellIcon className='h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-200' />
            <span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse' />
          </button>

          {/* User Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className='p-1 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 active:scale-95'
              aria-label='User menu'
              aria-haspopup='true'
              aria-expanded={userDropdownOpen}
            >
              <UserCircleIcon className='h-7 w-7 text-gray-600 hover:text-gray-900 transition-colors duration-200' />
            </button>
            
            {/* Dropdown Menu */}
            {userDropdownOpen && user && (
              <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 fade-in'>
                <div className='px-4 py-2 border-b border-gray-200'>
                  <p className='text-sm font-medium text-gray-900'>{user.email || 'User'}</p>
                </div>
                <Link
                  href='/settings'
                  className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200'
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <SettingsIcon className='mr-2 h-4 w-4' /> Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className='w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50'
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOutIcon className='mr-2 h-4 w-4' /> Logout
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className='md:hidden border-t border-gray-200 p-4 fade-in'>
          <form onSubmit={handleSearch} className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              ref={searchRef}
              type='search'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200'
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default Header; 