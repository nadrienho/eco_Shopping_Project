"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number; // Handling both just in case
  stock: number;
  status: string;
}

const FILTER_OPTIONS = [
  { label: "All Products", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function VendorStockPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
        let url = `${API_BASE_URL}/api/vendor/products/`;
        if (filter === "verified") url += "?status=verified";
        else if (filter === "pending") url += "?status=pending";
        else if (filter === "rejected") url += "?status=rejected";

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch products");
        }

        const data = await res.json();
        // Adjust the key below if your Django response is just the array directly
        setProducts(data.products || data); 
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "vendor") {
      fetchProducts();
    }
  }, [session, filter]); 

  async function updateStock(productId: number, newStock: number) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/products/${productId}/stock/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      }
    );
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock: newStock } : p
        )
      );
        setStatusMessage("Stock updated successfully!");

        setTimeout(() => setStatusMessage(null), 3000);
    } else {
      console.error("Failed to update stock", await res.text());
      setStatusMessage("Error updating stock.");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Stock Management</h1>
        <p className="text-green-100">View and manage product stock</p>
      </div>

      <div className="flex justify-end mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 text-gray-700"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
  
      <table className="min-w-full border text-gray-600 rounded-lg p-8 mt-6">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-200">Product</th>
            <th className="border px-4 py-2 bg-gray-200">Stock</th>
            <th className="border px-4 py-2 bg-gray-200">Update</th>
            <th className="border px-4 py-2 bg-gray-200">Stock Status</th>
            <th className="border px-4 py-2 bg-gray-200">Product Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={product.stock}
                  min={0}
                  onChange={(e) =>
                    updateStock(product.id, Number(e.target.value))
                  }
                />
              </td>
              <td className="border px-4 py-2">
                <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-150 hover:underline"
                    onClick={() => updateStock(product.id, product.stock)}
                >
                    Save
                </button>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{product.stock > 5 ? (
                  <span className="text-green-600 font-semibold">In Stock</span>
                ) : product.stock > 0 ? (
                  <span className="text-yellow-600 font-semibold">Low Stock</span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}
                </td>
                <td className="border-b py-2 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(product.status)}`}>
                            {product.status}
                        </span>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}