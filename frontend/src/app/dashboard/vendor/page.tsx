"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "vendor") {
      router.push("/login");
    }
  }, [status, session, router]);

  useEffect(() => {
    // Fetch products for the logged-in vendor
    const fetchTotalProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/products/?status=verified`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch products");
        }

        const data = await res.json();
        setTotalProducts(Array.isArray(data) ? data.length : (data.products?.length || 0));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  if (session?.user?.role === "vendor") {
    fetchTotalProducts();
  }
}, [session]);

  // Fetch and calculate total sales
  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/order-items/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch order items");
        }

        const items = await res.json();
        // Calculate total sales: sum of price * quantity for all items
        const total = items.reduce(
          (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
          0
        );
        setTotalSales(total);
      } catch (error) {
        console.error("Error fetching order items:", error);
      }
    };

    if (session?.user?.role === "vendor") {
      fetchTotalSales();
    }
  }, [session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome, {session?.user?.username}! 👋</h1>
        <p className="text-green-100">Vendor Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">📦</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalProducts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="text-lg font-semibold text-gray-900">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">£{totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0/5</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/vendor/products">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">🛍️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Products</h3>
            <p className="text-gray-600 text-sm mb-4">Add, edit, or manage your products</p>
            <button className="text-green-600 font-semibold text-sm hover:text-green-700">
              View Products →
            </button>
          </div>
        </Link>

        <Link href="/dashboard/vendor/stock">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Management</h3>
            <p className="text-gray-600 text-sm mb-4">Monitor and update inventory levels</p>
            <button className="text-green-600 font-semibold text-sm hover:text-green-700">
              Manage Stock →
            </button>
          </div>
        </Link>

        <Link href="/dashboard/vendor/certifications">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h3>
            <p className="text-gray-600 text-sm mb-4">Upload eco-certifications for your products</p>
            <button className="text-green-600 font-semibold text-sm hover:text-green-700">
              View Certifications →
            </button>
          </div>
        </Link>

        <Link href="/dashboard/vendor/orders">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
            <p className="text-gray-600 text-sm mb-4">View and manage customer orders</p>
            <button className="text-green-600 font-semibold text-sm hover:text-green-700">
              View Orders →
            </button>
          </div>
        </Link>
      </div>

      {/* Shop Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop Information</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Shop Name</p>
            <p className="text-lg font-semibold text-gray-900">My Eco Shop</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Shop Status</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}