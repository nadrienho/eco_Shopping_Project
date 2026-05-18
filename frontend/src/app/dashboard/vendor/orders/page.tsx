"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const ORDER_ITEM_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function VendorOrderItemsPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/order-items/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error("Raw response:", text);
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchItems();
  }, [token]);

  async function updateStatus(itemId: number, status: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/order-items/${itemId}/status/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status } : item
        )
      );
    }
  }

  // Calculate total sales
  const totalSales = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Order Management</h1>
        <p className="text-green-100">View and manage order items</p>
        <div className="mt-4 text-2xl font-semibold">
          Total Sales: £{totalSales.toFixed(2)}
        </div>
      </div>
      <table className="min-w-full border text-gray-600 rounded-lg p-8 mt-6">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-200">Order ID</th>
            <th className="border px-4 py-2 bg-gray-200">Product</th>
            <th className="border px-4 py-2 bg-gray-200">Quantity</th>
            <th className="border px-4 py-2 bg-gray-200">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.order_id}</td>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    item.status === "cancelled"
                      ? "bg-red-500"
                      : item.status === "delivered"
                      ? "bg-green-500"
                      : item.status === "shipped"
                      ? "bg-blue-500"
                      : item.status === "processing"
                      ? "bg-yellow-400"
                      : "bg-gray-400"
                  }`}
                  title={item.status}
                />
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  disabled={item.status === "cancelled"}
                >
                  {ORDER_ITEM_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}