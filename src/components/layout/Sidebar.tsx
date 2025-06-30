'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Lightbulb,
  FileText,
  Receipt,
  CalendarDays,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Bot,
  MessageSquare,
  Phone,
  Mail,
  Sparkles,
  LucideIcon,
  Menu,
  ArrowRight,
} from 'lucide-react';

interface SubNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: SubNavItem[];
  section?: string;
  flowStep?: number;
  description?: string;
}

// Organized according to VoltFlow CRM business flow
const navItems: NavItem[] = [
  // Core Overview
  { 
    href: '/', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    section: 'overview',
    description: ''
  },
  
  // Primary Business Flow (Lead → Client → Job → Quote → Invoice)
  { 
    href: '/leads', 
    label: 'Leads', 
    icon: Lightbulb, 
    section: 'flow',
    description: ''
  },
  { 
    href: '/clients', 
    label: 'Clients', 
    icon: Users, 
    section: 'flow',
    description: ''
  },
  { 
    href: '/jobs', 
    label: 'Jobs', 
    icon: Briefcase, 
    section: 'flow',
    description: ''
  },
  { 
    href: '/technicians', 
    label: 'Technicians', 
    icon: Users, 
    section: 'flow',
    description: ''
  },
  { 
    href: '/quotes', 
    label: 'Quotes', 
    icon: FileText, 
    section: 'flow',
    description: ''
  },
  { 
    href: '/invoices', 
    label: 'Invoices', 
    icon: Receipt, 
    section: 'flow',
    description: ''
  },
  
  // Operations & Analytics
  { 
    href: '/calendar', 
    label: 'Calendar', 
    icon: CalendarDays, 
    section: 'operations',
    description: ''
  },
  { 
    href: '/reports', 
    label: 'Reports', 
    icon: BarChart3, 
    section: 'operations',
    description: ''
  },
  
  // AI & Automation
  {
    href: '/ai-power',
    label: 'AI Power',
    icon: Sparkles,
    section: 'automation',
    description: '',
    subItems: [
      { href: '/ai-power/voice', label: 'Voice Agent', icon: Phone },
      { href: '/ai-power/sms', label: 'SMS Agent', icon: MessageSquare },
      { href: '/ai-power/email', label: 'Email Agent', icon: Mail },
      { href: '/ai-power/chat', label: 'Chat Assistant', icon: Bot },
    ],
  },
  
  // System Configuration
  { 
    href: '/settings', 
    label: 'Settings', 
    icon: SettingsIcon, 
    section: 'system',
    description: ''
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle submenu regardless of collapsed state
  const handleToggleSection = (href: string) => {
    setExpandedSection((prev) => (prev === href ? null : href));
  };

  // Group items by section
  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || 'default';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  // Section headers
  const sectionHeaders = {
    overview: 'Overview',
    flow: 'Business Flow',
    operations: 'Operations',
    automation: 'AI & Automation',
    system: 'System'
  };

  // Sidebar content as a function for reuse
  const sidebarContent = (
    <nav className='flex-grow mt-4'>
      <div className='space-y-6'>
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section}>
            {/* Section Header */}
            {!isCollapsed && sectionHeaders[section as keyof typeof sectionHeaders] && (
              <div className='px-3 mb-3'>
                <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  {sectionHeaders[section as keyof typeof sectionHeaders]}
                </h3>
                {section === 'flow' && (
                  <div className='mt-2 flex items-center text-xs text-gray-400'>
                    <span>Lead</span>
                    <ArrowRight className='h-3 w-3 mx-1' />
                    <span>Client</span>
                    <ArrowRight className='h-3 w-3 mx-1' />
                    <span>Job</span>
                    <ArrowRight className='h-3 w-3 mx-1' />
                    <span>Quote</span>
                    <ArrowRight className='h-3 w-3 mx-1' />
                    <span>Invoice</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Items */}
            <ul className='space-y-1'>
              {items.map((item) => {
                const isActive = pathname ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) : false;
                const IconComponent = item.icon;
                const hasSubItems = 'subItems' in item && item.subItems !== undefined;
                const isExpanded = expandedSection === item.href;

                return (
                  <li key={item.label}>
                    <div className='flex flex-col'>
                      {hasSubItems ? (
                        <button
                          type='button'
                          onClick={() => handleToggleSection(item.href)}
                          className={`flex items-center py-2 px-3 rounded-md transition-colors w-full relative cursor-pointer group
                            ${isActive ? 'bg-[#E8F0FE] border-l-4 border-[#1877F2] text-[#1877F2] font-semibold shadow-sm' : 'text-gray-700'}
                            ${isCollapsed ? 'justify-center' : ''}
                            hover:bg-primary/10 hover:text-primary-dark
                            focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:z-10`
                          }
                          tabIndex={0}
                          aria-current={isActive ? 'page' : undefined}
                          aria-expanded={isExpanded}
                          aria-controls={`submenu-${item.label}`}
                        >
                          <div className='flex items-center flex-1'>
                            {item.flowStep && !isCollapsed && (
                              <span className='w-5 h-5 text-xs bg-primary/10 text-primary rounded-full flex items-center justify-center mr-2 font-semibold'>
                                {item.flowStep}
                              </span>
                            )}
                            <IconComponent className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                            {!isCollapsed && (
                              <>
                                <div className='flex-1 text-left'>
                                  <span className='block'>{item.label}</span>
                                  {item.description && (
                                    <span className='text-xs text-gray-500 block'>{item.description}</span>
                                  )}
                                </div>
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                />
                              </>
                            )}
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center py-2 px-3 rounded-md transition-colors w-full relative cursor-pointer group
                            ${isActive ? 'bg-[#E8F0FE] border-l-4 border-[#1877F2] text-[#1877F2] font-semibold shadow-sm' : 'text-gray-700'}
                            ${isCollapsed ? 'justify-center' : ''}
                            hover:bg-primary/10 hover:text-primary-dark
                            focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:z-10`
                          }
                          tabIndex={0}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className='flex items-center flex-1'>
                            {item.flowStep && !isCollapsed && (
                              <span className='w-5 h-5 text-xs bg-primary/10 text-primary rounded-full flex items-center justify-center mr-2 font-semibold'>
                                {item.flowStep}
                              </span>
                            )}
                            <IconComponent className={`h-5 w-5 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                            {!isCollapsed && (
                              <div className='flex-1 text-left'>
                                <span className='block'>{item.label}</span>
                                {item.description && (
                                  <span className='text-xs text-gray-500 block'>{item.description}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      )}

                      {hasSubItems && isExpanded && item.subItems && (
                        <div id={`submenu-${item.label}`} className='ml-6 mt-1 space-y-1'>
                          {item.subItems.map((subItem) => {
                            const SubIconComponent = subItem.icon;
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className={`flex items-center py-2 px-3 rounded-md transition-colors
                                  ${isSubActive ? 'bg-[#E8F0FE] border-l-4 border-[#1877F2] text-[#1877F2] font-semibold shadow-sm' : 'text-gray-700'}
                                  hover:bg-primary/10 hover:text-primary-dark
                                  focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:z-10 cursor-pointer`
                                }
                                tabIndex={0}
                                aria-current={isSubActive ? 'page' : undefined}
                              >
                                <SubIconComponent className='mr-3 h-4 w-4' />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className='md:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1877F2]'
        onClick={() => setMobileOpen(true)}
        aria-label='Open sidebar'
      >
        <Menu className='h-6 w-6 text-gray-700' />
      </button>

      {/* Sidebar for desktop */}
      <aside
        className={`bg-gray-100 text-gray-800 p-4 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {sidebarContent}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='mt-auto p-2 rounded-md hover:bg-gray-200 self-center focus:outline-none focus:ring-2 focus:ring-primary'
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className='h-6 w-6 text-gray-600' /> : <ChevronLeft className='h-6 w-6 text-gray-600' />}
        </button>
      </aside>

      {/* Sidebar for mobile overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 flex'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/30 backdrop-blur-sm'
            onClick={() => setMobileOpen(false)}
            aria-label='Close sidebar backdrop'
          />
          <aside className='relative bg-gray-100 text-gray-800 p-4 w-64 flex flex-col h-full shadow-lg z-50 animate-slide-in-left'>
            <button
              className='absolute top-4 right-4 p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1877F2]'
              onClick={() => setMobileOpen(false)}
              aria-label='Close sidebar'
            >
              <ChevronLeft className='h-6 w-6 text-gray-600' />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar; 