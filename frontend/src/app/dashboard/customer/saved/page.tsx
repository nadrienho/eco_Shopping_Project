"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for the "View Cart" button

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  vendor_name?: string;
  category_name?: string;
  eco_score?: number;
}

export default function SavedProductsPage() {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<number | null>(null); // State for cart feedback

  useEffect(() => {
    const saved = localStorage.getItem("savedProducts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedProducts(parsed);
      } catch (error) {
        console.error("Failed to parse saved products", error);
      }
    }
    setLoading(false);
  }, []);

  const removeSavedProduct = (productId: number) => {
    const updated = savedProducts.filter((p) => p.id !== productId);
    setSavedProducts(updated);
    localStorage.setItem("savedProducts", JSON.stringify(updated));
  };

  const handleAddToCart = (productId: number) => {
    // Logic for adding to cart would go here
    setAddedToCart(productId);
    // Optional: Reset the "Added" state after 2 seconds
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg text-center mb-8">
        <h1 className="text-3xl font-bold">Saved Products</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((product) => (
            <div key={product.id} className="relative bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition overflow-hidden h-full">
              {/* Product Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-5xl">🌿</span>
              </div>

              {/* EcoScore Badge */}
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full shadow">
                Eco: {product.eco_score !== undefined ? product.eco_score : "N/A"}
              </div>

              {/* Remove (Trash) Button */}
              <button 
                onClick={() => removeSavedProduct(product.id)}
                className="absolute top-4 left-4 p-2 bg-white/90 rounded-full text-red-500 hover:text-red-700 shadow-sm transition"
                title="Remove from saved"
              >
                🗑️
              </button>

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

                {/* Price & Add to Cart */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-green-600">${product.price}</span>
                  
                  {addedToCart === product.id ? (
                    <Link
                      href="/dashboard/customer/browse/cart"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">❤️</div>
          <p className="text-gray-600 text-lg">No saved products yet!</p>
        </div>
      )}
    </div>
  );
}