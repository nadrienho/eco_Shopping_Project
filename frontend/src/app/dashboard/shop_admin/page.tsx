"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ShopAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a shop admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "shop_admin") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome, {session?.user?.username}! 👋</h1>
        <p className="text-green-100">Shop Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <div className="text-4xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Vendors</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <div className="text-4xl mb-2">📦</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <div className="text-4xl mb-2">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">Manage</p>
        </div>
      </div>
    </div>
  );
}