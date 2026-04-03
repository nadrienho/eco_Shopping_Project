"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard 👨‍💼</h1>
        <p className="text-blue-100">Manage the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <div className="text-4xl mb-2">👥</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <div className="text-4xl mb-2">📦</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">$0</p>
        </div>
      </div>
    </div>
  );
}