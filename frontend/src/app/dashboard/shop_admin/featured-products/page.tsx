// frontend/src/app/dashboard/shop_admin/featured-products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Product {
  id: number;
  name: string;
  price: string;
  image?: string | null;
  featured?: boolean;
  status?: string;
  eco_score?: number;
}

export default function FeaturedProductsAdmin() {
  const { data: session, status } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (status !== "authenticated" || !session?.accessToken) return;

      setLoading(true);

      try {
        const token = session.accessToken;

        const [productsRes, featuredRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/featured/`, {
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!productsRes.ok) {
          throw new Error("Failed to fetch products.");
        }

        if (!featuredRes.ok) {
          throw new Error("Failed to fetch featured products.");
        }

        const productsData = await productsRes.json();
        const featuredData = await featuredRes.json();

        const normalizedProducts = Array.isArray(productsData)
          ? productsData
          : productsData.results || [];

        const normalizedFeatured = Array.isArray(featuredData)
          ? featuredData
          : featuredData.results || [];

        setProducts(normalizedProducts);
        setSelected(normalizedFeatured.map((product: Product) => product.id));
      } catch (error) {
        console.error("Error loading featured products page:", error);
        alert("Could not load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [session, status]);

  const handleSelect = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((productId) => productId !== id);
      }

      if (prev.length >= 3) {
        alert("You can only feature up to 3 products.");
        return prev;
      }

      return [...prev, id];
    });
  };

  const saveFeaturedProducts = async () => {
    if (!session?.accessToken) {
      alert("You must be logged in as a shop admin.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/featured/set/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            product_ids: selected,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to save featured products:", data);
        alert(data.error || "Failed to update featured products.");
        return;
      }

      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          featured: selected.includes(product.id),
        }))
      );

      alert("Featured products updated successfully!");
    } catch (error) {
      console.error("Error saving featured products:", error);
      alert("Could not save featured products. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600 font-medium">Loading featured products...</p>
      </div>
    );
  }

  const selectedProducts = products.filter((product) =>
    selected.includes(product.id)
  );

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Featured Products</h1>
        <p className="text-green-100">
          Choose up to 3 products to display on the Eco-Shop home page.
        </p>

        <div className="mt-4 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
          {selected.length}/3 selected
        </div>
      </div>

      <div className="bg-white border border-green-200 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Select Home Page Products
            </h2>
            <p className="text-gray-600 mt-1">
              Tick the products you want customers to see first.
            </p>
          </div>

          <button
            onClick={saveFeaturedProducts}
            disabled={saving}
            className={`px-5 py-2.5 rounded-lg text-white font-semibold transition ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save Featured Products"}
          </button>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-bold text-green-800 mb-2">
              Currently selected
            </h3>

            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <span
                  key={product.id}
                  className="inline-flex items-center rounded-full bg-white border border-green-300 px-3 py-1 text-sm font-medium text-green-800"
                >
                  {product.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <p className="text-gray-600">No products available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="px-4 py-3 border-b">Feature</th>
                  <th className="px-4 py-3 border-b">Product</th>
                  <th className="px-4 py-3 border-b">Price</th>
                  <th className="px-4 py-3 border-b">Eco Score</th>
                  <th className="px-4 py-3 border-b">Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const isSelected = selected.includes(product.id);
                  const isDisabled = !isSelected && selected.length >= 3;

                  return (
                    <tr
                      key={product.id}
                      className={`transition ${
                        isSelected
                          ? "bg-green-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3 border-b">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => handleSelect(product.id)}
                          className="h-5 w-5 accent-green-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="px-4 py-3 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">🌿</span>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.name}
                            </p>

                            {product.featured && (
                              <p className="text-xs text-green-600 font-medium">
                                Currently featured
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 border-b text-gray-700">
                        £{Number(product.price).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 border-b text-gray-700">
                        {typeof product.eco_score === "number"
                          ? product.eco_score.toFixed(2)
                          : "N/A"}
                      </td>

                      <td className="px-4 py-3 border-b">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            product.status === "verified"
                              ? "bg-green-100 text-green-700"
                              : product.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.status || "unknown"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
