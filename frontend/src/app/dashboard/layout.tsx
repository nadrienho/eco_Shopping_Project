"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import SearchResults from "@/components/SearchResults";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// 1. Import the unified Role type
import { Role } from "@/types/roles"; 

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
  
  // 2. Use the imported Role type for the state
  const [userRole, setUserRole] = useState<Role>("customer");

  // Set user role from session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      // 3. Cast the session role to the imported Role type
      const role = session.user.role as Role;
      setUserRole(role);
      console.log("User role set to:", role);
    }
  }, [session, status]);

  // Redirect based on role and path
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as Role;
      const dashboardType = pathname.split("/")[2]; 

      if (dashboardType && dashboardType !== role) {
        console.log(`Redirecting from /${dashboardType} to /${role}`);
        router.push(`/dashboard/${role}`);
        setIsValidPath(false);
        return;
      }

      setIsValidPath(true);
    }
  }, [status, session, pathname, router]);

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

  if (status === "unauthenticated" || !isValidPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white-400">
      <DashboardHeader onSearch={setSearchResults} />

      <div className="flex flex-1">
        {/* 4. Sidebar now receives the correctly typed role */}
        <Sidebar role={userRole} />

        <main className="flex-1 p-8 overflow-auto">
          <SearchResults results={searchResults} />
          {children}
        </main>
      </div>
    </div>
  );
}