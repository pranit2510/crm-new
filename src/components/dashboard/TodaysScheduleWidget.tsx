'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { jobOperations } from '@/lib/supabase-client';
import type { Job } from '@/lib/supabase-types';

interface TodaysJob extends Job {
  client_name?: string;
  time?: string;
  location?: string;
}

const TodaysScheduleWidget = () => {
  const [todaysJobs, setTodaysJobs] = useState<TodaysJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysSchedule();
  }, []);

  const loadTodaysSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all jobs
      const allJobs = await jobOperations.getAll();

      // Transform and sort by time
      const transformedJobs = allJobs
        .filter((job: any) => job.status === 'pending' || job.status === 'in_progress')
        .map((job: any) => {
          const startTime = job.start_date ? new Date(job.start_date) : null;
          return {
            ...job,
            client_name: job.clients?.name || 'Unknown Client',
            time: startTime ? startTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }) : 'TBD',
            location: job.service_address || job.clients?.address || 'Location TBD'
          };
        })
        .sort((a, b) => {
          if (!a.start_date || !b.start_date) return 0;
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });

      setTodaysJobs(transformedJobs);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Scheduled';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow h-full'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <Calendar className='mr-2 h-5 w-5 text-blue-500' />
          Today&apos;s Schedule
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <Calendar className='mr-2 h-5 w-5 text-blue-500' />
          Today&apos;s Schedule
        </h3>
        <div className="text-center text-red-600 p-4">
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadTodaysSchedule}
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
      <div className="flex items-center justify-between mb-4">
        <h3 className='text-xl font-semibold text-gray-800 flex items-center'>
          <Calendar className='mr-2 h-5 w-5 text-blue-500' />
          Upcoming Schedule
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {todaysJobs.length > 0 ? (
          <div className='space-y-3'>
            {todaysJobs.map((job) => (
              <div key={job.id} className='p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border-l-4 border-blue-500'>
                <div className='flex justify-between items-start mb-2'>
                  <div className="flex items-center">
                    <Clock className='h-4 w-4 text-gray-500 mr-1' />
                    <span className='font-medium text-blue-600'>
                      {new Date(job.start_date!).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })} at {job.time}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                </div>
                
                <h4 className='font-medium text-gray-900 mb-1'>{job.title}</h4>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className='h-3 w-3 mr-1' />
                    <span>Client: {job.client_name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className='h-3 w-3 mr-1' />
                    <span>{job.location}</span>
                  </div>
                  {job.priority && job.priority !== 'medium' && (
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      job.priority === 'high' ? 'bg-red-100 text-red-700' : 
                      job.priority === 'low' ? 'bg-gray-100 text-gray-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <Calendar className='mx-auto h-12 w-12 text-gray-400 mb-3' />
            <h4 className='text-lg font-medium text-gray-900 mb-2'>No upcoming jobs</h4>
            <p className='text-gray-500 text-sm mb-4'>You have no pending or in-progress jobs scheduled!</p>
            <Link 
              href='/jobs/new' 
              className='inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium'
            >
              Schedule a job
            </Link>
          </div>
        )}
      </div>

      {todaysJobs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Link 
            href='/calendar' 
            className='text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center font-medium'
          >
            View full calendar
          </Link>
        </div>
      )}
    </div>
  );
};

export default TodaysScheduleWidget; 