"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Home, Clock, Target, User } from 'lucide-react';

const tabs = [
  { name: 'Today', href: '/dashboard/today', icon: Home },
  { name: 'Time', href: '/dashboard/time', icon: Clock },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Me', href: '/dashboard/me', icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      {/* <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 relative">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🌱</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              OneHabit
            </h1>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-md px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Enhanced with glassmorphism */}
      <nav className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 flex justify-around px-2 py-2 shadow-lg z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (pathname === '/dashboard' && tab.href === '/dashboard/today');
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center text-xs py-3 px-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative ${
                isActive 
                  ? 'text-green-600 bg-green-50/80 scale-105 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
              )}
              <Icon size={22} className="mb-1 flex-shrink-0" />
              <span className="font-semibold text-xs truncate">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}