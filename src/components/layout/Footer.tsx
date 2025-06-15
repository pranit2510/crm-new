"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-gray-50 border-t border-gray-200 text-sm text-gray-600'>
      <div className='container mx-auto px-4 py-6 md:flex md:items-center md:justify-between'>
        <div className='mb-4 md:mb-0'>
          <p>&copy; {currentYear} VoltFlow CRM. All rights reserved.</p>
        </div>
        <div className='flex space-x-4'>
          <Link href='/privacy-policy' className='hover:text-primary'>
            Privacy Policy
          </Link>
          <Link href='/terms-of-service' className='hover:text-primary'>
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 