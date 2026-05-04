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

export default function VendorProducts() {
  const { data: session } = useSession();
  
  // 2. Properly type the state to avoid 'never[]'
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Products</h1>
        <button
          onClick={() => router.push("/dashboard/vendor/products/create")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add Product
        </button>
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

      {products.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Stock</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Stock Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-600">{product.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{product.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">£{product.price}</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{product.stock}</td>
                
                <td className="border border-gray-300 px-4 py-2 text-gray-600">{product.stock > 5 ? (
                  <span className="text-green-600 font-semibold">In Stock</span>
                ) : product.stock > 0 ? (
                  <span className="text-yellow-600 font-semibold">Low Stock</span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}</td>
                <td className="border-b py-2 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(product.status)}`}>
                            {product.status}
                        </span>
                </td>
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