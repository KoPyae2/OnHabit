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
      {/* <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌱</span>
            <h1 className="text-2xl font-bold text-green-600">OneHabit</h1>
          </div>
        </div>
      </header> */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 relative">
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
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-md px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t flex justify-around px-2 py-2 shadow-lg z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (pathname === '/dashboard' && tab.href === '/dashboard/today');
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center text-xs py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive 
                  ? 'text-green-600 bg-green-50 scale-105' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className="mb-1 flex-shrink-0" />
              <span className="font-medium text-xs truncate">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}