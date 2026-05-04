"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const METRICS = [
  { key: "name", label: "Product Name" },
  { key: "description", label: "Description" },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
  { key: "category", label: "Category" },
  { key: "weight", label: "Weight" },
  { key: "material_type", label: "Material Type" },
  { key: "transport_distance", label: "Transport Distance" },
  { key: "transport_mode", label: "Transport Mode" },
  { key: "energy_usage", label: "Energy Usage" },
  { key: "grid_intensity", label: "Grid Intensity" },
  // Add more as needed
];

export default function ProductReviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState<any>(null);
  const [approvals, setApprovals] = useState<{ [key: string]: boolean }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop-admin/pending-products/${productId}/`, {
      headers: {
        Authorization: `Bearer ${session?.user?.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        // Default all approvals to true
        setApprovals(
          METRICS.reduce((acc, m) => ({ ...acc, [m.key]: true }), {})
        );
      });
  }, [productId, session]);

  const handleApproval = (key: string, value: boolean) => {
    setApprovals((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/shop-admin/pending-products/${productId}/approve/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify({ approvals }),
      }
    );
    setSubmitting(false);
    router.push("/dashboard/shop_admin/products");
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-4 text-white shadow mb-6">
        <h1 className="text-xl font-semibold">Review Product: {product.name}</h1>
        <p className="text-sm">Review the product details and approve or reject each metric.</p>
      </div>
      {product.image && (
        <div className="flex justify-center mb-6">
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-48 object-cover rounded shadow"
          />
        </div>
      )}  
      <table className="w-full mb-6 ">
        <tbody className="divide-y text-gray-700">
          {METRICS.map((metric) => (
            <tr key={metric.key}>
              <td className="py-2 font-semibold">{metric.label}</td>
              <td className="py-2">
                {metric.key === "category"
                    ? product.category?.name || ""
                    : String(product[metric.key])}
              </td>
              <td className="py-2">
                <select
                  value={approvals[metric.key] ? "approve" : "reject"}
                  onChange={(e) =>
                    handleApproval(metric.key, e.target.value === "approve")
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}