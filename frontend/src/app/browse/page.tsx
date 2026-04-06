"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  eco_score: number;
  image_url?: string;
  vendor_name?: string;
}

export default function PublicBrowseProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { data: session } = useSession();

  useEffect(() => {
    fetchProducts();
  }, [filter, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/`;
      
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("eco_score__gte", filter);
      }
      if (sortBy === "price_low") {
        params.append("ordering", "price");
      } else if (sortBy === "price_high") {
        params.append("ordering", "-price");
      } else if (sortBy === "eco_score") {
        params.append("ordering", "-eco_score");
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      const productsList = data.results || data;
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">♻️</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Eco-Shop</span>
          </Link>
          <div className="flex gap-3">
            {session ? (
              <Link
                href="/dashboard/customer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Browse Products</h1>
          <p className="text-gray-600 mt-2">Discover sustainable products with transparent eco-scores</p>
        </div>

        {/* Filters & Sorting */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Eco Score</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Products</option>
              <option value="70">70+ Score</option>
              <option value="80">80+ Score</option>
              <option value="90">90+ Score</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="eco_score">Best Eco Score</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-8">
            <p className="text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition overflow-hidden">
                {/* Product Image */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-5xl">🌿</span>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {product.vendor_name && (
                    <p className="text-gray-500 text-xs mb-2">
                      By: {product.vendor_name}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-green-600">${product.price}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                      Eco: {product.eco_score}
                    </span>
                  </div>

                  <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products State */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-600 text-lg">No products found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}