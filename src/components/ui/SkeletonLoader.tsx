"use client";

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'table' | 'dashboard-card' | 'list-item';
  lines?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'text', 
  lines = 1,
  className = '' 
}) => {
  switch (variant) {
    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="skeleton-text w-full" style={{ width: i === lines - 1 ? '75%' : '100%' }} />
          ))}
        </div>
      );
      
    case 'card':
      return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
          <div className="skeleton h-6 w-3/4 mb-4" />
          <div className="space-y-2">
            <div className="skeleton-text w-full" />
            <div className="skeleton-text w-5/6" />
            <div className="skeleton-text w-4/6" />
          </div>
          <div className="skeleton h-10 w-24 mt-4" />
        </div>
      );
      
    case 'dashboard-card':
      return (
        <div className={`bg-white p-6 rounded-lg shadow h-full ${className}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-6 w-6 rounded" />
          </div>
          <div className="skeleton h-10 w-20 mb-4 mt-auto" />
          <div className="skeleton h-4 w-24" />
        </div>
      );
      
    case 'table':
      return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="skeleton h-6 w-48" />
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="skeleton h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="skeleton h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      
    case 'list-item':
      return (
        <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="skeleton h-5 w-48 mb-2" />
              <div className="skeleton h-4 w-32" />
            </div>
            <div className="skeleton h-8 w-8 rounded-full" />
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

export default SkeletonLoader; 