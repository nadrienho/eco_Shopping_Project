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
      const dashboardType = pathname.split("/")[2]; 

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
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header stays at the top */}
      <DashboardHeader onSearch={setSearchResults} />

      <div className="flex flex-1 relative">
        {/* SIDEBAR: Since it is 'fixed' in your component, 
          it doesn't take up space in the flex flow. 
        */}
        <Sidebar role={userRole} />

        {/* MAIN CONTENT: 
          1. We add 'pl-64' (Padding Left) or 'ml-64' (Margin Left) to push 
             the content to the right of the 256px fixed sidebar.
          2. 'w-full' ensures it fills the remaining space.
        */}
        <main className="flex-1 ml-64 p-8 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <SearchResults results={searchResults} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}