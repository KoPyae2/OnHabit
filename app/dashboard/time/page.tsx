"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HabitTimeline } from "@/components/habit-timeline";
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

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-600 text-sm mt-1">Track your habit progress over time</p>
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