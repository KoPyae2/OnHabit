"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProfilePage } from "@/components/profile-page";
import { User, Settings } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function MePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [convexUser, setConvexUser] = useState<any>(null);

  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const getUserByGoogleId = useQuery(
    api.users.getUserByGoogleId,
    session?.user?.id ? { googleId: session.user.id } : "skip"
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
              <div className="animate-spin h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
              <User className="h-6 w-6 text-purple-600 absolute top-3 left-3" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">Loading your profile...</p>
              <p className="text-sm text-gray-500">Preparing your personal space</p>
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
            <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
              <User className="h-8 w-8 text-purple-600" />
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
        {/* Beautiful Header Section - matching goals and time pages */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl rounded-full"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Manage your account and track your journey for <span className="font-semibold text-purple-600">{getCurrentMonth()}</span>
              </p>
            </div>
          </div>
        </div>
        
        {convexUser?._id && (
          <ProfilePage userId={convexUser._id} />
        )}
      </div>
    </DashboardLayout>
  );
}