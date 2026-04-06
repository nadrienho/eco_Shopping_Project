"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import SearchResults from "@/components/SearchResults";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "admin" | "vendor" | "customer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isValidPath, setIsValidPath] = useState(true);
  const [userRole, setUserRole] = useState<Role>("customer");

  // Set user role from session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as Role;
      setUserRole(role);
      console.log("User role set to:", role);
    }
  }, [session, status]);

  // Redirect based on role and path
  useEffect(() => {
    if (status === "loading") return;

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If authenticated, check role-based access
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as Role;

      // Extract the dashboard type from pathname
      const dashboardType = pathname.split("/")[2]; // e.g., "customer", "vendor", "admin"

      // Check if user is accessing the correct dashboard
      if (dashboardType && dashboardType !== role) {
        // User is trying to access wrong dashboard, redirect to their own
        console.log(`Redirecting from /${dashboardType} to /${role}`);
        router.push(`/dashboard/${role}`);
        setIsValidPath(false);
        return;
      }

      setIsValidPath(true);
    }
  }, [status, session, pathname, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (status === "unauthenticated") {
    return null;
  }

  // Invalid path state (redirecting)
  if (!isValidPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white-400">
      {/* Green Header with Search and Logout */}
      <DashboardHeader onSearch={setSearchResults} />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Pass the actual user role */}
        <Sidebar role={userRole} />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Search Results */}
          <SearchResults results={searchResults} />

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}