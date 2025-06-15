"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRightCircle } from 'lucide-react'; // Example icon

interface SummaryCardWidgetProps {
  title: string;
  count: string | number;
  linkText: string;
  linkHref: string;
  icon?: React.ElementType; // Optional icon component
  iconColor?: string; // Optional tailwind color class for icon
}

const SummaryCardWidget: React.FC<SummaryCardWidgetProps> = ({
  title,
  count,
  linkText,
  linkHref,
  icon: IconComponent,
  iconColor = 'text-primary',
}) => {
  return (
    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col card-hover group'>
      <div className='flex justify-between items-start mb-2'>
        <h3 className='text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200'>{title}</h3>
        {IconComponent && (
          <IconComponent className={`h-6 w-6 ${iconColor} group-hover:scale-110 transition-transform duration-200`} />
        )}
      </div>
      <p className='text-4xl font-bold text-primary mb-4 mt-auto group-hover:scale-105 transition-transform duration-200 origin-left'>{count}</p>
      <Link 
        href={linkHref} 
        className='text-sm text-primary-dark hover:text-primary flex items-center group/link transition-colors duration-200'
      >
        {linkText} 
        <ArrowRightCircle size={16} className='ml-1 group-hover/link:translate-x-1 transition-transform duration-200' />
      </Link>
    </div>
  );
};

export default SummaryCardWidget; 