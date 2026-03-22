"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "customer") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">♻️</span>
            <h1 className="text-xl font-bold text-gray-900">Eco-Shop</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, <strong>{session?.user?.username}</strong>
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              👤 Customer
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* My Orders */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <span className="text-4xl">📦</span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>

          {/* Carbon Saved */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">CO2 Saved</p>
                <p className="text-3xl font-bold text-gray-900">0 kg</p>
              </div>
              <span className="text-4xl">🌱</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border border-green-300 rounded-lg hover:bg-green-50 transition text-left">
              <p className="font-semibold text-gray-900">🛍️ Continue Shopping</p>
              <p className="text-sm text-gray-600">Browse our eco-friendly products</p>
            </button>
            <button className="p-4 border border-green-300 rounded-lg hover:bg-green-50 transition text-left">
              <p className="font-semibold text-gray-900">📋 View Orders</p>
              <p className="text-sm text-gray-600">Check your order history</p>
            </button>
            <button className="p-4 border border-green-300 rounded-lg hover:bg-green-50 transition text-left">
              <p className="font-semibold text-gray-900">⚙️ My Profile</p>
              <p className="text-sm text-gray-600">Update your account settings</p>
            </button>
            <button className="p-4 border border-green-300 rounded-lg hover:bg-green-50 transition text-left">
              <p className="font-semibold text-gray-900">💚 Wishlist</p>
              <p className="text-sm text-gray-600">View your saved items</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
