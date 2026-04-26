// src/app/dashboard/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import SearchResults from "@/components/SearchResults";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [userRole, setUserRole] = useState<Role>("customer");
  
  // New State for Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      setUserRole(session.user.role as Role);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as Role;
      const pathParts = pathname.split("/");
      const dashboardType = pathParts[2]; 

      if (dashboardType && dashboardType !== role) {
        router.push(`/dashboard/${role}`);
        setIsValidPath(false);
        return;
      }
      setIsValidPath(true);
    }
  }, [status, session, pathname, router]);

  if (status === "loading" || !isValidPath || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4 text-green-600">⌛</div>
          <p className="text-gray-600 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header stays at the top. 
      */}
      <DashboardHeader onSearch={setSearchResults} />

      <div className="flex flex-1 relative">
        <Sidebar 
          role={userRole} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />

        {/* DYNAMIC MARGIN: 
            ml-64 when open (256px) 
            ml-20 when collapsed (80px)
        */}
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out bg-gray-50 p-8 ${
            isCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <SearchResults results={searchResults} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}