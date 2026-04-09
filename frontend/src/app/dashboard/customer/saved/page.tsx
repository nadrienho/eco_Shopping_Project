"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

export default function SavedProductsPage() {
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("savedProducts");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedProducts(parsed); // Set the full product objects
    }
    setLoading(false);
  }, []);
  const removeSavedProduct = (productId: number) => {
    const updated = savedProducts.filter((p) => p.id !== productId);
    setSavedProducts(updated);
    localStorage.setItem("savedProducts", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Saved Products</h1>

        {!loading && savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition overflow-hidden relative">
                <button 
                  onClick={() => removeSavedProduct(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
                <div className="p-4">
                    {/* The ?. prevents the "Cannot read properties of undefined" crash */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product?.name || "Unknown Product"}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product?.description || "No description available"}</p>
                    <span className="text-lg font-bold text-green-600">
                        {product?.price ? `$${product.price}` : "Price N/A"}
                    </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-5xl mb-4">❤️</div>
              <p className="text-gray-600 text-lg">No saved products yet!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}