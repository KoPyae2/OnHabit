"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show redirecting message
  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 w-32 h-32 bg-gradient-to-br from-green-200/20 to-green-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-8 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-8 w-28 h-28 bg-gradient-to-br from-orange-200/20 to-orange-300/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-4 w-20 h-20 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-xl"></div>
      </div>


      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 relative z-10 min-h-screen">
        <div className="max-w-sm mx-auto w-full space-y-6 my-auto">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            {/* Animated Logo */}
            <div className="relative animate-float">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg animate-glow">
                <span className="text-4xl">🌱</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-blue-600 bg-clip-text text-transparent">
                Build Better Habits
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                Track your daily habits, build streaks, and stay motivated with your partner or solo
              </p>
            </div>

            {/* Sign In Button */}
            <Button
              size="lg"
              onClick={() => signIn("google")}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 py-3 animate-gradient min-h-[48px] text-base font-semibold"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Features - Enhanced Cards */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">✨ Available Features</h2>

            <div className="space-y-3">
              {/* Feature 1 - Daily Tracking */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">Daily Check-ins</h3>
                    <p className="text-xs text-gray-600">One-tap habit completion with mood tracking</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Streak Tracking */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-100 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">🔥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">Streak Tracking</h3>
                    <p className="text-xs text-gray-600">Monitor current & best streaks with celebrations</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 - Partner Support */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">💕</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">Partner Sync</h3>
                    <p className="text-xs text-gray-600">Build habits together with sync bonuses</p>
                  </div>
                </div>
              </div>

              {/* Feature 4 - Analytics */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">Smart Analytics</h3>
                    <p className="text-xs text-gray-600">AI-powered insights & pattern analysis</p>
                  </div>
                </div>
              </div>

              {/* Feature 5 - Goal Management */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">Monthly Goals</h3>
                    <p className="text-xs text-gray-600">Set & track goals with progress monitoring</p>
                  </div>
                </div>
              </div>

              {/* Feature 6 - Notes & Reflection */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-teal-100 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">📝</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">Notes & Reflection</h3>
                    <p className="text-xs text-gray-600">Add personal notes to your daily check-ins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-First Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">📱</span>
                <h3 className="font-semibold text-gray-800 text-sm">Mobile-First Design</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Touch-optimized</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Fast loading</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Real-time sync</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Smooth animations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="relative bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            </div>

            <div className="relative text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm">🌟</span>
                <p className="text-xs text-gray-600 font-medium">Join the growing community</p>
                <span className="text-sm">🚀</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">2.5K+</div>
                  <div className="text-xs text-gray-500">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">75K+</div>
                  <div className="text-xs text-gray-500">Habits Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">850+</div>
                  <div className="text-xs text-gray-500">Happy Couples</div>
                </div>
              </div>
              <div className="pt-2 border-t border-green-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-green-600">95%</span> of users build lasting habits within 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-100 py-3 mt-auto">
        <div className="max-w-sm mx-auto px-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} OneHabit
            </p>
            <p className="text-xs text-gray-400">
              Building better habits, one day at a time 🌱
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
