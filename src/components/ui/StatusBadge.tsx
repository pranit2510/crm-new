'use client';

import React from 'react';
import { getStatusColor, getStageInfo } from '@/lib/flowStates';

interface StatusBadgeProps {
  module: 'leads' | 'clients' | 'quotes' | 'jobs' | 'invoices';
  status: string;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  module,
  status,
  showDescription = false,
  size = 'md',
  className = ''
}) => {
  const stageInfo = getStageInfo(module, status);
  const colorClasses = getStatusColor(module, status);
  
  if (!stageInfo) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${className}`}>
        {status}
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span
        className={`inline-flex items-center rounded-full font-semibold transition-all duration-200 group-hover:scale-105 ${colorClasses} ${sizeClasses[size]}`}
        title={showDescription ? stageInfo.description : undefined}
      >
        {stageInfo.name}
      </span>
      {showDescription && (
        <div className="ml-2 text-xs text-gray-500 max-w-xs">
          {stageInfo.description}
        </div>
      )}
    </div>
  );
};

export default StatusBadge; 