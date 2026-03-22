"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "vendor") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <h1 className="text-xl font-bold text-gray-900">Eco-Shop Vendor</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Shop: <strong>{session?.user?.shop_name || session?.user?.username}</strong>
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              🏪 Vendor
            </span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <span className="text-4xl">📦</span>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>

          {/* Orders This Month */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Orders This Month</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </div>

          {/* Avg Eco-Score */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Eco-Score</p>
                <p className="text-3xl font-bold text-gray-900">--</p>
              </div>
              <span className="text-4xl">🌱</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📦 Product Management</h2>
            <div className="space-y-2">
              <button className="w-full p-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition text-left font-medium text-gray-900">
                ➕ Add New Product
              </button>
              <button className="w-full p-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition text-left font-medium text-gray-900">
                📋 View My Products
              </button>
              <button className="w-full p-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition text-left font-medium text-gray-900">
                📈 Product Analytics
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Order Management</h2>
            <div className="space-y-2">
              <button className="w-full p-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition text-left font-medium text-gray-900">
                🔔 Pending Orders
              </button>
              <button className="w-full p-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition text-left font-medium text-gray-900">
                ✅ All Orders
              </button>
              <button className="w-full p-3 border border-purple-300 rounded-lg hover:bg-purple-50 transition text-left font-medium text-gray-900">
                📊 Sales Report
              </button>
            </div>
          </div>
        </div>

        {/* Shop Settings */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ Shop Settings</h2>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Edit Shop Profile
          </button>
        </div>
      </main>
    </div>
  );
}
