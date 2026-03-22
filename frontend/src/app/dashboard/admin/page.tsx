"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <h1 className="text-xl font-bold text-gray-900">Eco-Shop Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Admin: <strong>{session?.user?.username}</strong>
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              ⚙️ Administrator
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
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>

          {/* Total Vendors */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <span className="text-4xl">🏪</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <span className="text-4xl">📦</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">👥 User Management</h2>
            <div className="space-y-2">
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                📋 View All Users
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                🔍 Manage Vendors
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                🚫 Suspended Accounts
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📦 Product Moderation</h2>
            <div className="space-y-2">
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                ⏳ Pending Approvals
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                ✅ Approved Products
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                🚫 Flagged Products
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Reports & Analytics</h2>
            <div className="space-y-2">
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                📈 Sales Report
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                🌱 Eco-Impact Report
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                📋 User Activity Log
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ System Settings</h2>
            <div className="space-y-2">
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                🔧 Site Configuration
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                💳 Payment Settings
              </button>
              <button className="w-full p-3 border border-orange-300 rounded-lg hover:bg-orange-50 transition text-left font-medium text-gray-900">
                📧 Email Templates
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
