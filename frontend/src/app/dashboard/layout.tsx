"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import SearchResults from "@/components/SearchResults";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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

  // Default to customer if role missing
  const role = session?.user?.role as "admin" | "vendor" | "customer" || "customer";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Green Header with Search and Logout */}
      <DashboardHeader onSearch={setSearchResults} />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar role={role} />

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