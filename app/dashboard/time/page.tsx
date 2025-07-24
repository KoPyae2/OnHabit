"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HabitTimeline } from "@/components/habit-timeline";
import { Calendar, BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function TimePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [convexUser, setConvexUser] = useState<any>(null);

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const getUserByGoogleId = useQuery(
    api.users.getUserByGoogleId,
    session?.user?.id ? { googleId: session.user.id } : "skip"
  );

  const userHabits = useQuery(
    api.habits.getUserHabits,
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

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  return (
    <DashboardLayout>
      <div className="py-4 space-y-6">
        {/* Beautiful Header Section - matching goals page design */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Habit Timeline
              </h1>
              <p className="text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Track your habit progress and patterns for <span className="font-semibold text-green-600">{getCurrentMonth()}</span>
              </p>
            </div>
          </div>
        </div>
        
        {convexUser?._id && (
          <HabitTimeline
            userId={convexUser._id}
            habits={userHabits || []}
          />
        )}
      </div>
    </DashboardLayout>
  );
}