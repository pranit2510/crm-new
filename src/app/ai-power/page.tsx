'use client';

import React from 'react';
import { Sparkles, Phone, MessageSquare, Mail, Bot } from 'lucide-react';
import Link from 'next/link';

const aiAgents = [
  {
    title: 'Voice Agent',
    description: 'AI-powered voice assistant for handling customer calls, scheduling appointments, and providing service information.',
    icon: Phone,
    href: '/ai-power/voice',
    features: [
      '24/7 customer support',
      'Appointment scheduling',
      'Service information',
      'Call routing',
      'Voice analytics'
    ]
  },
  {
    title: 'SMS Agent',
    description: 'Automated SMS responses for appointment confirmations, reminders, and quick customer queries.',
    icon: MessageSquare,
    href: '/ai-power/sms',
    features: [
      'Appointment reminders',
      'Service updates',
      'Quick responses',
      'Two-way messaging',
      'Template management'
    ]
  },
  {
    title: 'Email Agent',
    description: 'Smart email handling for customer inquiries, quotes, and follow-ups.',
    icon: Mail,
    href: '/ai-power/email.tsx',
    features: [
      'Email categorization',
      'Auto-responses',
      'Quote generation',
      'Follow-up automation',
      'Email analytics'
    ]
  },
  {
    title: 'Chat Assistant',
    description: 'AI chat assistant for website and app support, handling common queries and lead generation.',
    icon: Bot,
    href: '/ai-power/chat',
    features: [
      'Live chat support',
      'Lead qualification',
      'FAQ handling',
      'Service booking',
      'Chat analytics'
    ]
  }
];

const AIPowerPage = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6 sm:mb-8">
        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[#1877F2] mr-2 sm:mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Power</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {aiAgents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Link
              key={agent.title}
              href={agent.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:border-[#1877F2] hover:shadow-md transition-all duration-200 p-4 sm:p-6"
            >
              <div className="flex items-start mb-4">
                <div className="bg-[#1877F2]/10 p-2 sm:p-3 rounded-lg group-hover:bg-[#1877F2]/20 transition-colors">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#1877F2]" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-[#1877F2] transition-colors">
                    {agent.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{agent.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h3>
                <ul className="space-y-1 sm:space-y-2">
                  {agent.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 bg-[#1877F2] rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AIPowerPage; 