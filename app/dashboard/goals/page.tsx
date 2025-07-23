"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MonthlyGoals } from "@/components/monthly-goals";
import { GoalAnalytics } from "@/components/goal-analytics";
import { GoalTemplates } from "@/components/goal-templates";
import { GoalProgressChart } from "@/components/goal-progress-chart";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Sparkles, TrendingUp } from "lucide-react";

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [convexUser, setConvexUser] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const getUserByGoogleId = useQuery(
    api.users.getUserByGoogleId,
    session?.user?.id ? { googleId: session.user.id } : "skip"
  );

  const userHabits = useQuery(
    api.habits.getUserHabits,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const monthlyGoals = useQuery(
    api.goals.getUserMonthlyGoals,
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

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
              <Target className="h-6 w-6 text-blue-600 absolute top-3 left-3" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">Loading your goals...</p>
              <p className="text-sm text-gray-500">Preparing your success journey</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">Redirecting...</p>
              <p className="text-sm text-gray-500">Taking you to the home page</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-4 space-y-6">
        {/* Beautiful Header Section */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Monthly Goals
              </h1>
              <p className="text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Transform your habits into achievements for <span className="font-semibold text-blue-600">{getCurrentMonth()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Analytics - Only show if user has goals */}
        {convexUser?._id && monthlyGoals && monthlyGoals.length > 0 && (
          <GoalAnalytics userId={convexUser._id} />
        )}

        {/* Goal Templates */}
        {convexUser?._id && showTemplates && (
          <GoalTemplates 
            onSelectTemplate={(template) => {
              setShowTemplates(false);
            }}
          />
        )}

        {/* Main Goals Component */}
        {convexUser?._id && (
          <MonthlyGoals
            userId={convexUser._id}
            habits={userHabits || []}
            onShowTemplates={() => setShowTemplates(true)}
          />
        )}

      </div>
    </DashboardLayout>
  );
}