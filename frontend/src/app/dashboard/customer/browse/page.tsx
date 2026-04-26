"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  vendor_name?: string;
  category_name?: string;
  eco_score?: number;
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
  const [filter, setFilter] = useState("all");
  const [addedToCart, setAddedToCart] = useState<number | null>(null); // Track the product added to the cart

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPrice, setFilterPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // This creates an array to store the IDs of products the user hearts
  const [savedProducts, setSavedProducts] = useState<number[]>([]);


  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filterCategory, filterPrice, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`);
      const data = await res.json();
      console.log("Fetched categories:", data); // Debug log
      setCategories(data);
      console.log("Categories:", data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products/`;

      // Add filters
      const params = new URLSearchParams();
      if (filterCategory !== "all") {
        params.append("category", filterCategory);
      }
      if (filterPrice !== "all") {
        params.append("price__lte", filterPrice); // Assuming `price__lte` is supported in the backend
      }
      console.log("Fetching products with URL:", url);
      if (sortBy === "price_low") {
        params.append("ordering", "price");
      } else if (sortBy === "price_high") {
        params.append("ordering", "-price");
      } else if (sortBy === "newest") {
        params.append("ordering", "-created_at");
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      // Handle both paginated and non-paginated responses
      const productsList = data.results || data;
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveProduct = (product: Product) => {
    const saved = localStorage.getItem("savedProducts");
    const savedProducts = saved ? JSON.parse(saved) : [];

    const isSaved = savedProducts.some((p: Product) => p.id === product.id);
    const updated = isSaved
        ? savedProducts.filter((p: Product) => p.id !== product.id) // Remove product
        : [...savedProducts, product]; // Add product

    localStorage.setItem("savedProducts", JSON.stringify(updated));
    setSavedProducts(updated.map((p: Product) => p.id)); // Update the state with product IDs
  };

  const handleAddToCart = async (productId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add product to cart");
      }
      setAddedToCart(productId); // Update the state to reflect the product added to the cart
      

      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

//   const toggleSaveProduct = (productId: number) => {
//     setSavedProducts((prev) =>
//       prev.includes(productId)
//         ? prev.filter((id) => id !== productId) // Remove from saved
//         : [...prev, productId] // Add to saved
//     );
//   };

  

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg text-center">
        <h1 className="text-3xl font-bold">Browse Eco-Friendly Products</h1>
        <p className="text-green-100 mt-2">Discover sustainable products with transparent eco-scores</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow flex flex-col md:flex-row gap-4">
        {/* Filter by Category */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {Array.isArray(categories) &&
                categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
            ))}
          </select>
        </div>

        {/* Filter by Price */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Price</label>
          <select
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Prices</option>
            <option value="50">Under $50</option>
            <option value="100">Under $100</option>
            <option value="200">Under $200</option>
          </select>
        </div>

        {/* Sort By */}
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
          </select>
        </div>
      </div>


      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition overflow-hidden cursor-pointer h-full">
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <span className="text-5xl">🌿</span>
                    {/* Save Icon */}
                    <button
                        onClick={() => toggleSaveProduct(product)}
                        className="absolute top-2 right-2 text-2xl"
                    >
                    {savedProducts.includes(product.id) ? (
                        <span className="text-red-500">❤️</span> // Filled heart
                    ) : (
                        <span className="text-gray-400">🤍</span> // Empty heart
                    )}
                    </button>
                </div>
                {/* EcoScore */}
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full shadow">
                    {product.eco_score !== undefined ? product.eco_score : "N/A"}
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
                {/* <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-green-600">${product.price}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                      Eco: {product.eco_score}
                    </span>
                </div> */}

                {/* Price & Add to Cart */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-green-600">${product.price}</span>
                  {addedToCart === product.id ? (
                    <Link
                      href="/dashboard/customer/browse/cart"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                    >
                      View Cart
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Loading State */}
      {loading && <p>Loading products...</p>}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* No Products State */}
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">No products found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}


    </div>
  );
}