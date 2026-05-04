"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Product = {
  id: number;
  name: string;
  category: { name: string };
  vendor: string;
  price: string;
  status: string;
};

const FILTER_OPTIONS = [
  { label: "All Products", value: "all" },
  { label: "Pending Products", value: "pending" },
  { label: "Verified Products", value: "verified" },
  { label: "Rejected Products", value: "rejected" },
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

export default function ShopAdminPendingProducts() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);

    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/shop_admin/products/`;
    if (filter === "verified") url += "?status=verified";
    else if (filter === "pending") url += "?status=pending";
    else if (filter === "rejected") url += "?status=rejected";
    // For "all", no status param

    fetch(url, {
      headers: {
        Authorization: `Bearer ${session?.user?.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data); 
        setProducts(Array.isArray(data) ? data : data.products || []);
        setLoading(false);
      });
  }, [session, status, filter]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Product Management</h1>
        <p className="text-green-100">View and manage all products.</p>
      </div>
      <div className="flex items-center justify-between mb-6 text-gray-700">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="bg-gray-300 p-6 rounded-lg border border-gray-300 shadow">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-300">
                <th className="border-b py-3 px-4 text-black font-semibold">Name</th>
                <th className="border-b py-3 px-4 text-black font-semibold">Category</th>
                <th className="border-b py-3 px-4 text-black font-semibold">Vendor</th>
                <th className="border-b py-3 px-4 text-black font-semibold">Price</th>
                <th className="border-b py-3 px-4 text-black font-semibold">Status</th>
                <th className="border-b py-3 px-4 text-black font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product, index) => (
                <tr key={product.id}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"} hover:bg-gray-200`}
                >
                    <td className="border-b py-2 px-4 text-gray-800">{product.name}</td>
                    <td className="border-b py-2 px-4 text-gray-800">{product.category?.name}</td>
                    <td className="border-b py-2 px-4 text-gray-800">{product.vendor}</td>
                    <td className="border-b py-2 px-4 text-gray-800">£{product.price}</td>
                    <td className="border-b py-2 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(product.status)}`}>
                            {product.status}
                        </span>
                    </td>
                    <td className="border-b py-3 px-4">
                        <button
                            onClick={() => router.push(`/dashboard/shop_admin/products/review?id=${product.id}`)}
                            className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600`}
                        >
                            Review
                        </button>
                </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
