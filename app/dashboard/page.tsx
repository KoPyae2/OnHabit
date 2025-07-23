"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the today tab by default
    router.push("/dashboard/today");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to Today...</p>
      </div>
    </div>
  );
}