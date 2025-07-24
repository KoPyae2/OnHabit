"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CreateHabitModal } from "@/components/create-habit-modal";
import { InvitePartnerModal } from "@/components/invite-partner-modal";
import { HabitCard } from "@/components/habit-card";
import { HabitItemToday } from "@/components/habit-item-today";
import { HabitCalendarModal } from "@/components/habit-calendar-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, Copy, Check, CheckCircle2, Circle, Users, Plus, Sparkles, Trophy, Calendar, Quote } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// Daily motivational quotes
const dailyQuotes = [
  "Small steps every day lead to big changes.",
  "Progress, not perfection.",
  "Your only limit is your mind.",
  "Consistency is the key to success.",
  "Every habit is a vote for the person you want to become.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't wait for motivation. Start with discipline.",
  "The journey of a thousand miles begins with one step.",
  "You are what you repeatedly do. Excellence is not an act, but a habit."
];

// Get today's quote based on date
const getTodaysQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return dailyQuotes[dayOfYear % dailyQuotes.length];
};

// Get formatted date
const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
};

export default function TodayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [convexUser, setConvexUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const toggleCheckin = useMutation(api.checkins.toggleCheckin);
  const getUserByGoogleId = useQuery(
    api.users.getUserByGoogleId,
    session?.user?.id ? { googleId: session.user.id } : "skip"
  );

  // Query user habits and today's check-ins
  const userHabits = useQuery(
    api.habits.getUserHabits,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const todaysCheckins = useQuery(
    api.checkins.getTodaysCheckinsForCouple,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Query couple info
  const coupleInfo = useQuery(
    api.couples.getCoupleInfo,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  // Query user profile for avatar
  const userProfile = useQuery(
    api.profile.getUserProfile,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/home");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && !convexUser) {
      const syncUser = async () => {
        try {
          const userId = await createOrUpdateUser({
            googleId: session.user.id!,
            email: session.user.email!,
            name: session.user.name!,
            photoUrl: session.user.image || undefined,
          });
          console.log("User synced with Convex:", userId);
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      };
      syncUser();
    }
  }, [session?.user, convexUser, createOrUpdateUser]);

  useEffect(() => {
    if (getUserByGoogleId) {
      setConvexUser(getUserByGoogleId);
    }
  }, [getUserByGoogleId]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-green-500 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading your habits...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading while redirecting
  if (status === "unauthenticated") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to home...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const totalHabits = userHabits?.length || 0;
  const completedToday = todaysCheckins?.filter(c => c.checked && c.userId === convexUser?._id)?.length || 0;
  const partnerCompletedToday = todaysCheckins?.filter(c => c.checked && c.userId !== convexUser?._id)?.length || 0;
  const currentStreaks = userHabits?.filter(h => {
    const checkin = todaysCheckins?.find(c => c.habitId === h._id && c.userId === convexUser?._id);
    return checkin?.checked;
  })?.length || 0;
  
  // Calculate completion percentage
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Check if both user and partner completed habits today
  const bothCompletedToday = coupleInfo?.hasPartner && 
    completedToday > 0 && 
    todaysCheckins?.some(c => c.userId !== convexUser?._id && c.checked);

  const copyInviteCode = async () => {
    if (coupleInfo?.inviteCode) {
      try {
        await navigator.clipboard.writeText(coupleInfo.inviteCode);
        setCopied(true);
        toast.success("Invite code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy invite code");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 pt-2 px-1">
        {/* Personalized Greeting & Date */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{getFormattedDate()}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hi {userProfile?.displayName || userProfile?.name || session?.user?.name?.split(' ')[0] || 'there'}, 
            <br />
            <span className="text-green-600">ready to build your habits?</span>
          </h1>
        </div>

        {/* Daily Motivational Quote */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <Quote className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-blue-900 font-medium text-sm italic">
                "{getTodaysQuote()}"
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Overview */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Today's Progress</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
                <div className="text-xs text-gray-500">complete</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={completionPercentage} 
                className="h-3 bg-gray-100"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{completedToday} completed</span>
                <span>{totalHabits - completedToday} remaining</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Daily Habits Card */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-500 rounded-md">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">Daily Habits</h3>
                    <p className="text-lg font-bold text-green-600">
                      {completedToday}/{totalHabits}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Streaks Card */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500 rounded-md">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">Active Streaks</h3>
                    <p className="text-lg font-bold text-orange-600">
                      {currentStreaks} 🔥
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Status Card - Mobile Optimized */}
        <div className={`p-3 rounded-lg shadow-sm border ${
          convexUser?.coupleId ? (
            coupleInfo?.hasPartner 
              ? "bg-gradient-to-r from-blue-100 to-white border-blue-200/50" 
              : "bg-gradient-to-r from-amber-100 to-white border-amber-200/50"
          ) : "bg-gradient-to-r from-gray-100 to-white border-gray-200/50"
        }`}>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              Partner Status
            </h3>
            
            {/* Mobile-friendly partner layout */}
            <div className="space-y-2">
              {/* User row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar 
                    src={userProfile?.profileImageUrl || userProfile?.googlePhotoUrl}
                    name={userProfile?.displayName || userProfile?.name || "You"}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {userProfile?.displayName || userProfile?.name || "You"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {completedToday}/{totalHabits}
                </span>
              </div>

              {/* Connection status */}
              <div className="flex items-center justify-center py-1">
                {convexUser?.coupleId ? (
                  coupleInfo?.hasPartner ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Waiting</span>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs font-medium">Solo</span>
                  </div>
                )}
              </div>

              {/* Partner row */}
              <div className="flex items-center justify-between">
                {convexUser?.coupleId && coupleInfo?.hasPartner ? (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar 
                        src={coupleInfo.partner?.profileImageUrl || coupleInfo.partner?.photoUrl}
                        name={coupleInfo.partner?.displayName || coupleInfo.partner?.name || "Partner"}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {coupleInfo.partner?.displayName || coupleInfo.partner?.name || "Partner"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {partnerCompletedToday}/{totalHabits}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full opacity-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-3 w-3 text-gray-400" />
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        {convexUser?.coupleId ? "Waiting..." : "No partner"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">0/{totalHabits}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invite/Share Actions */}
            {convexUser?._id && (
              <div className="pt-2 border-t border-gray-200/50">
                {!convexUser?.coupleId ? (
                  /* No partner - Show invite button */
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Build habits together</p>
                    <InvitePartnerModal userId={convexUser._id}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs w-full">
                        <Users className="h-3 w-3 mr-1" />
                        Invite Partner
                      </Button>
                    </InvitePartnerModal>
                  </div>
                ) : !coupleInfo?.hasPartner && coupleInfo?.inviteCode ? (
                  /* Waiting for partner - Show invite code */
                  <div className="text-center space-y-2">
                    <p className="text-xs text-amber-700">Share invite code:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-white border border-amber-300 px-2 py-1 rounded text-xs font-mono font-bold text-amber-800 flex-1 text-center">
                        {coupleInfo.inviteCode}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyInviteCode}
                        className="border-amber-300 hover:bg-amber-100 p-1.5 flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-amber-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Sync Bonus Banner - Compact */}
        {bothCompletedToday && (
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <Trophy className="h-4 w-4 text-yellow-500" />
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-purple-900 text-sm">🎉 Sync Bonus!</h3>
              <p className="text-purple-700 text-xs mt-1">Both completed habits today! 🚀</p>
            </div>
          </div>
        )}

        {/* Today's Habits List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-gray-900">Today's Habits</h2>
            <div className="flex items-center gap-2">
              {totalHabits > 0 && (
                <>
                  <HabitCalendarModal habits={userHabits} checkins={todaysCheckins}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-2 sm:px-3 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Calendar className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline ml-1">Calendar</span>
                    </Button>
                  </HabitCalendarModal>
                  <div className="text-sm text-gray-500">
                    {completedToday}/{totalHabits} done
                  </div>
                </>
              )}
            </div>
          </div>
          
          {userHabits && userHabits.length > 0 ? (
            <div className="space-y-2">
              {userHabits.map((habit) => (
                <HabitItemToday
                  key={habit._id}
                  habit={habit}
                  userId={convexUser._id}
                  todaysCheckins={todaysCheckins || []}
                  coupleInfo={coupleInfo}
                  userInfo={userProfile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gradient-to-b from-green-50 to-white rounded-lg border border-green-100">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No habits yet!
              </h3>
              <p className="text-gray-500 text-sm mb-4 px-4">
                Start your journey by creating your first habit
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Fixed Bottom Create Button */}
        {convexUser?._id && (
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-md">
            <div className="max-w-md mx-auto">
              <CreateHabitModal
                userId={convexUser._id}
                hasPartner={!!convexUser?.coupleId}
              >
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl rounded-full py-4 font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl float-button animate-glow"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {userHabits && userHabits.length > 0
                    ? "Create Another Habit"
                    : "Create Your First Habit"
                  }
                </Button>
              </CreateHabitModal>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}