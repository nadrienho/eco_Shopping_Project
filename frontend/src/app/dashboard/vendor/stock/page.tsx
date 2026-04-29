"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Product = {
  id: number;
  name: string;
  stock: number;
};

export default function VendorStockPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/products/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        }
      );
      if (res.ok) {
        setProducts(await res.json());
      }
      setLoading(false);
    }
    if (session?.user?.access_token) fetchProducts();
  }, [session]);

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
        <h1 className="text-4xl font-bold mb-2">Welcome, {session?.user?.username}! 👋</h1>
        <p className="text-green-100">Manage Stock</p>
      </div>
  
      <table className="min-w-full border text-gray-600 rounded-lg p-8 mt-6">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-gray-200">Product</th>
            <th className="border px-4 py-2 bg-gray-200">Stock</th>
            <th className="border px-4 py-2 bg-gray-200">Update</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}