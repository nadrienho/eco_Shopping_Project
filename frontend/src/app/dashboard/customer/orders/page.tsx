"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Import session

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  total_cost: number;
  status: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession(); // Get session status
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      // Only fetch if we are sure the user is logged in
      if (status !== "authenticated") return;

      setLoading(true);
      try {
        const token = session?.user?.access_token;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/view/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchOrders();
    }
  }, [status, session]); // Dependencies: run when login status changes

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="animate-pulse text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700 font-semibold">⚠️ Please log in to view your order history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg text-center">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6 padding-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Order #{order.id}</h2>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)} bg-opacity-10 bg-current`}>
                  {order.status}
                </span>
              </div>
              
              <div className="p-6 space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-medium">{item.name}</h3>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 px-6 py-4 flex justify-between items-center border-t border-green-100">
                <p className="text-gray-700 font-medium text-sm">Amount Paid</p>
                <p className="text-xl font-bold text-green-700">${order.total_cost.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "text-yellow-600";
    case "shipped":
      return "text-blue-600";
    case "delivered":
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}