"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, Building, Users, Shield, 
  LayoutGrid, FileText, Webhook
} from 'lucide-react';

const settingsGroups = [
  {
    id: 'general',
    title: 'General',
    items: [
      { name: 'Personal Settings', description: 'Manage your profile and preferences', icon: User, href: '/settings/personal', buttonText: 'View profile' },
      { name: 'Company Details', description: 'Manage organization details and logo', icon: Building, href: '#', buttonText: 'Update details' },
    ]
  },
  {
    id: 'users',
    title: 'Users & Control',
    items: [
      { name: 'Users', description: 'Manage employees, roles and access', icon: Users, href: '/settings/users', buttonText: 'Manage users' },
      { name: 'Security Control', description: 'Password policies and 2FA', icon: Shield, href: '#', buttonText: 'Configure security' },
    ]
  },
  {
    id: 'customization',
    title: 'Customization',
    items: [
      { name: 'Modules and Fields', description: 'Customize standard and custom modules', icon: LayoutGrid, href: '#', buttonText: 'Customize fields' },
      { name: 'Templates', description: 'Email and inventory templates', icon: FileText, href: '#', buttonText: 'Manage templates' },
    ]
  },
  {
    id: 'data',
    title: 'Data Administration',
    items: [
      { name: 'Audit Log', description: 'Track all system transactions', icon: FileText, href: '/transactions', buttonText: 'View logs' },
    ]
  },
  {
    id: 'automation',
    title: 'Automation',
    items: [
      { name: 'Webhooks', description: 'Trigger external APIs on events', icon: Webhook, href: '/settings/webhooks', buttonText: 'Manage webhooks' },
      { name: 'Workflow Rules', description: 'Automate manual processes', icon: Webhook, href: '#', buttonText: 'View rules' },
    ]
  }
];

export default function SettingsHubPage() {
  const [activeTab, setActiveTab] = useState('general');
  const activeGroup = settingsGroups.find(g => g.id === activeTab) || settingsGroups[0];

  return (
    <div className="flex flex-col min-h-full bg-white font-sans">
      
      {/* Header and Tabs */}
      <div className="pt-8 px-8 md:px-12 bg-white sticky top-0 z-10 pb-0">
        <div className="max-w-[1080px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[30px] font-semibold text-[#101828] tracking-tight">Settings</h1>
            <button className="text-[#667085] hover:text-[#101828] p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 10C10.8333 9.53976 10.4602 9.16667 10 9.16667C9.53976 9.16667 9.16667 9.53976 9.16667 10C9.16667 10.4602 9.53976 10.8333 10 10.8333Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 4.16667C10.4602 4.16667 10.8333 3.79357 10.8333 3.33333C10.8333 2.8731 10.4602 2.5 10 2.5C9.53976 2.5 9.16667 2.8731 9.16667 3.33333C9.16667 3.79357 9.53976 4.16667 10 4.16667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17.5C10.4602 17.5 10.8333 17.1269 10.8333 16.6667C10.8333 16.2064 10.4602 15.8333 10 15.8333C9.53976 15.8333 9.16667 16.2064 9.16667 16.6667C9.16667 17.1269 9.53976 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-[#EAECF0] pb-4">
            {settingsGroups.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-[14px] font-semibold rounded-md whitespace-nowrap transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#F2F4F7] text-[#101828]' 
                      : 'text-[#667085] hover:text-[#344054] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-8 bg-white">
        <div className="max-w-[1080px] mx-auto pb-24">
          
          <div className="animate-in fade-in duration-300">
            {/* Section Header */}
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-[16px] font-semibold text-[#101828]">{activeGroup.title}</h2>
                <p className="text-[14px] text-[#475467] mt-1">Configure your workspace {activeGroup.title.toLowerCase()} preferences.</p>
              </div>
            </div>
            
            <div className="border-t border-[#EAECF0]" />

            {/* List of Minimal Settings Rows */}
            <div className="flex flex-col">
              {activeGroup.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isLinkActive = item.href !== '#';
                
                return (
                  <div key={itemIdx} className="flex flex-col sm:flex-row sm:items-center py-6 border-b border-[#EAECF0] gap-6">
                    
                    {/* Left: Icon, Title, Description */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-none w-10 h-10 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] text-[#475467] flex items-center justify-center shadow-sm">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-[14px] font-semibold text-[#344054]">
                          {item.name}
                        </h3>
                        <p className="text-[14px] text-[#475467] mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="flex-none sm:ml-4">
                      {isLinkActive ? (
                        <Link 
                          href={item.href}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-[14px] font-semibold bg-white border border-[#D0D5DD] text-[#344054] shadow-sm hover:bg-[#F9FAFB] transition-all"
                        >
                          {item.buttonText}
                        </Link>
                      ) : (
                        <button 
                          disabled
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-[14px] font-semibold bg-[#F9FAFB] border border-[#EAECF0] text-[#98A2B3] cursor-not-allowed"
                        >
                          {item.buttonText}
                        </button>
                      )}
                    </div>
                    
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
