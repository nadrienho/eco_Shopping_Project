"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  vendor_name?: string;
  category_name?: string;
  eco_score?: number;
  image: string;
}

interface Category {
  id: number;
  name: string;
}

export default function PublicBrowsePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPrice, setFilterPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Local-only states
  const [savedProducts, setSavedProducts] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedProducts");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedProducts(parsed.map((p: Product) => p.id));
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filterCategory, filterPrice, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // public endpoint
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/`;
      const params = new URLSearchParams();

      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterPrice !== "all") params.append("price__lte", filterPrice);

      // sort
      if (sortBy === "price_low") params.append("ordering", "price");
      else if (sortBy === "price_high") params.append("ordering", "-price");
      else params.append("ordering", "-created_at");

      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const productsList = data.results || data;
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Redirect guests to login instead of saving
  const toggleSaveProduct = (product: Product) => {
    // Check if user token/session exists (adjust this key if your app stores differently)
    const token = localStorage.getItem("access_token");

    if (!token) {
      // redirect unauthenticated user
      router.push("/login");
      return;
    }

    const saved = localStorage.getItem("savedProducts");
    const savedList: Product[] = saved ? JSON.parse(saved) : [];

    const exists = savedList.some((p) => p.id === product.id);
    const updated = exists
      ? savedList.filter((p) => p.id !== product.id)
      : [...savedList, product];

    localStorage.setItem("savedProducts", JSON.stringify(updated));
    setSavedProducts(updated.map((p) => p.id));
  };

  return (
    <div className="space-y-6 bg-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg text-center">
        <h1 className="text-3xl font-bold">Explore Eco-Friendly Products</h1>
        <p className="text-green-100 mt-2">Shop sustainably, make a difference</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Limit
          </label>
          <select
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Prices</option>
            <option value="50">Under £50</option>
            <option value="100">Under £100</option>
            <option value="200">Under £200</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Cards */}
      {loading && <p>Loading products...</p>}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={savedProducts.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product)}
            />
          ))}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-5xl mb-3">🌿</div>
          <p className="text-gray-600 text-lg">No products found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}
