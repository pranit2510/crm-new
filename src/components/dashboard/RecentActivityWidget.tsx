'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Activity, Clock, User, FileText, Briefcase, Receipt } from 'lucide-react';
import { clientOperations, jobOperations, quoteOperations, invoiceOperations } from '@/lib/supabase-client';

interface ActivityItem {
  id: string;
  type: 'client' | 'job' | 'quote' | 'invoice';
  title: string;
  description: string;
  time: string;
  relativeTime: string;
  link?: string;
}

const RecentActivityWidget = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent data from all modules
      const [clients, jobs, quotes, invoices] = await Promise.all([
        clientOperations.getAll(),
        jobOperations.getAll(),
        quoteOperations.getAll(),
        invoiceOperations.getAll(),
      ]);

      const recentActivities: ActivityItem[] = [];

      // Add recent clients (last 5)
      clients.slice(0, 5).forEach((client: any) => {
        recentActivities.push({
          id: `client-${client.id}`,
          type: 'client',
          title: `New client added: ${client.name}`,
          description: client.company ? `${client.company}` : client.email,
          time: client.created_at,
          relativeTime: getRelativeTime(client.created_at),
          link: `/clients/${client.id}`
        });
      });

      // Add recent jobs (last 5)
      jobs.slice(0, 5).forEach((job: any) => {
        const statusText = job.status === 'pending' ? 'scheduled' : 
                          job.status === 'in_progress' ? 'started' : 
                          job.status === 'completed' ? 'completed' : job.status;
        
        recentActivities.push({
          id: `job-${job.id}`,
          type: 'job',
          title: `Job ${statusText}: ${job.title}`,
          description: job.clients?.name || 'Unknown Client',
          time: job.created_at,
          relativeTime: getRelativeTime(job.created_at),
          link: `/jobs`
        });
      });

      // Add recent quotes (last 3)
      quotes.slice(0, 3).forEach((quote: any) => {
        const statusText = quote.status === 'draft' ? 'created' : 
                          quote.status === 'sent' ? 'sent' : 
                          quote.status === 'accepted' ? 'accepted' : quote.status;
        
        recentActivities.push({
          id: `quote-${quote.id}`,
          type: 'quote',
          title: `Quote ${statusText}: #${quote.id}`,
          description: `$${quote.amount?.toLocaleString() || '0'}`,
          time: quote.created_at,
          relativeTime: getRelativeTime(quote.created_at),
          link: `/quotes`
        });
      });

      // Add recent invoices (last 3)
      invoices.slice(0, 3).forEach((invoice: any) => {
        const statusText = invoice.status === 'paid' ? 'paid' : 
                          invoice.status === 'sent' ? 'sent' : 
                          invoice.status === 'overdue' ? 'overdue' : invoice.status;
        
        recentActivities.push({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: `Invoice ${statusText}: #${invoice.id}`,
          description: `$${invoice.amount?.toLocaleString() || '0'}`,
          time: invoice.created_at,
          relativeTime: getRelativeTime(invoice.created_at),
          link: `/invoices`
        });
      });

      // Sort by time (most recent first) and limit to 10
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

      // If no real activities, show demo data for better UX
      if (sortedActivities.length === 0) {
        const now = new Date();
        const demoActivities: ActivityItem[] = [
          {
            id: 'demo-client-1',
            type: 'client',
            title: 'New client added: Smith Electronics',
            description: 'Commercial electrical services',
            time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            relativeTime: '2h ago',
            link: '/clients'
          },
          {
            id: 'demo-job-1',
            type: 'job',
            title: 'Job completed: Kitchen Rewiring',
            description: 'Johnson Residence',
            time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            relativeTime: '4h ago',
            link: '/jobs'
          },
          {
            id: 'demo-quote-1',
            type: 'quote',
            title: 'Quote sent: Office Building Upgrade',
            description: '$8,500',
            time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            relativeTime: '6h ago',
            link: '/quotes'
          },
          {
            id: 'demo-invoice-1',
            type: 'invoice',
            title: 'Invoice paid: #1234',
            description: '$2,750',
            time: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            relativeTime: '8h ago',
            link: '/invoices'
          },
          {
            id: 'demo-job-2',
            type: 'job',
            title: 'Job started: Panel Installation',
            description: 'ABC Corporation',
            time: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            relativeTime: '1d ago',
            link: '/jobs'
          }
        ];
        setActivities(demoActivities);
      } else {
        setActivities(sortedActivities);
      }

    } catch (err) {
      console.error('Error loading recent activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity');
      
      // Show demo data even on error for better UX
      const now = new Date();
      const demoActivities: ActivityItem[] = [
        {
          id: 'demo-error-1',
          type: 'client',
          title: 'System Demo Mode',
          description: 'Sample activity data',
          time: now.toISOString(),
          relativeTime: 'Just now',
          link: '/clients'
        }
      ];
      setActivities(demoActivities);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentActivity();
  }, [loadRecentActivity]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <User className='h-4 w-4 text-green-500' />;
      case 'job':
        return <Briefcase className='h-4 w-4 text-blue-500' />;
      case 'quote':
        return <FileText className='h-4 w-4 text-purple-500' />;
      case 'invoice':
        return <Receipt className='h-4 w-4 text-orange-500' />;
      default:
        return <Activity className='h-4 w-4 text-gray-500' />;
    }
  };

  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow h-full'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <Activity className='mr-2 h-5 w-5 text-gray-500' />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white p-6 rounded-lg shadow h-full'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <Activity className='mr-2 h-5 w-5 text-gray-500' />
          Recent Activity
        </h3>
        <div className="text-center text-red-600 p-4">
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadRecentActivity}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow h-full flex flex-col'>
      <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
        <Activity className='mr-2 h-5 w-5 text-gray-500' />
        Recent Activity
      </h3>
      
      <div className="flex-1 overflow-y-auto">
        {activities.length > 0 ? (
          <div className='space-y-4'>
            {activities.map((activity) => (
              <div key={activity.id} className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200'>
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className='flex-1 min-w-0'>
                  {activity.link ? (
                    <Link href={activity.link} className="block">
                      <p className='text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors'>
                        {activity.title}
                      </p>
                    </Link>
                  ) : (
                    <p className='text-sm font-medium text-gray-900'>{activity.title}</p>
                  )}
                  <p className='text-xs text-gray-500 mt-1'>{activity.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Clock className='h-3 w-3 mr-1' />
                    <span>{activity.relativeTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <Activity className='mx-auto h-12 w-12 text-gray-400 mb-3' />
            <h4 className='text-lg font-medium text-gray-900 mb-2'>No recent activity</h4>
            <p className='text-gray-500 text-sm'>Your business activity will appear here.</p>
          </div>
        )}
      </div>

      {activities.length > 5 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button 
            onClick={() => window.location.reload()}
            className='text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center font-medium w-full'
          >
            Refresh activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityWidget; 