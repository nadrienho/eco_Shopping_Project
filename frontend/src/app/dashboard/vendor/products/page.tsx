"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// 1. Define the Product interface to satisfy the TypeScript compiler
interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number; // Handling both just in case
  stock: number;
}

export default function VendorProducts() {
  const { data: session } = useSession();
  
  // 2. Properly type the state to avoid 'never[]'
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 3. Use Environment Variable for the live site
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        
        const res = await fetch(`${API_BASE_URL}/api/products/vendor/`, {
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
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="animate-spin text-3xl">⏳</div>
        <p className="ml-2">Loading your products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <button
          onClick={() => router.push("/dashboard/vendor/products/create")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add Product
        </button>
      </div>

      {products.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-medium">{product.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{product.description}</td>
                <td className="border border-gray-300 px-4 py-2">${product.price}</td>
                <td className="border border-gray-300 px-4 py-2">{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 p-10 text-center rounded-lg">
          <p className="text-gray-500 mb-4">No products found.</p>
          <button
            onClick={() => router.push("/dashboard/vendor/products/create")}
            className="text-blue-500 underline hover:text-blue-700"
          >
            Create your first product
          </button>
        </div>
      )}
    </div>
  );
}