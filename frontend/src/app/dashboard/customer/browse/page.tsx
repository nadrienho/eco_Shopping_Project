"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

export default function BrowseProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPrice, setFilterPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const [savedProducts, setSavedProducts] = useState<number[]>([]);
  const [cartProducts, setCartProducts] = useState<number[]>([]);

  // Load initial saved products
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
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/`;
      const params = new URLSearchParams();

      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterPrice !== "all") params.append("price__lte", filterPrice);

      if (sortBy === "price_low") params.append("ordering", "price");
      else if (sortBy === "price_high") params.append("ordering", "-price");
      else params.append("ordering", "-created_at");

      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      const productsList = data.results || data;
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveProduct = (product: Product) => {
    const saved = localStorage.getItem("savedProducts");
    const savedList: Product[] = saved ? JSON.parse(saved) : [];

    const exists = savedList.some((p) => p.id === product.id);
    const updated = exists
      ? savedList.filter((p) => p.id !== product.id)
      : [...savedList, product];

    localStorage.setItem("savedProducts", JSON.stringify(updated));
    setSavedProducts(updated.map((p) => p.id));
  };

  const toggleCart = async (productId: number) => {
    const isInCart = cartProducts.includes(productId);
    const endpoint = isInCart ? "remove" : "add";

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${endpoint}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: JSON.stringify({ product_id: productId, quantity: 1 }),
        }
      );
      if (!res.ok) throw new Error("Cart update failed");

      const updated = isInCart
        ? cartProducts.filter((id) => id !== productId)
        : [...cartProducts, productId];
      setCartProducts(updated);
    } catch (error) {
      console.error("Cart update error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg text-center">
        <h1 className="text-3xl font-bold">Browse Eco-Friendly Products</h1>
        <p className="text-green-100 mt-2">
          Discover sustainable products with transparent eco-scores
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
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
            Filter by Price
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
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={savedProducts.includes(product.id)}
              isInCart={cartProducts.includes(product.id)}
              onToggleSave={() => toggleSaveProduct(product)}
              onToggleCart={() => toggleCart(product.id)}
            />
          ))}
        </div>
      )}

      {loading && <p>Loading products...</p>}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}
