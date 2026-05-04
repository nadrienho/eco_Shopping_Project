"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

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

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}/`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!session?.user?.access_token) {
      alert("Please log in first.");
      return;
    }

    try {
      if (isInCart) {
        // Proceed to checkout
        router.push("/dashboard/customer/browse/cart");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.access_token}`,
        },
        body: JSON.stringify({
          product_id: Number(id),
          quantity: 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to add product to cart");
      setIsInCart(true);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Cart error:", error);
      alert("Failed to update cart");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">Product not found.</p>
      </div>
    );
  }

  const getEcoColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product image */}
        <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Product details */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

            {product.category_name && (
              <p className="text-sm text-gray-500 mb-4">
                Category: {product.category_name}
              </p>
            )}

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center gap-3">
              {product.eco_score !== undefined && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded ${getEcoColor(
                    product.eco_score
                  )}`}
                >
                  Eco Score: {product.eco_score}/100
                </span>
              )}
              <span className="text-2xl font-bold text-green-700">
                £{product.price}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                isInCart
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isInCart ? "Proceed to Checkout" : "Add to Cart"}
            </button>

            <button
              onClick={() => router.back()}
              className="w-full mt-3 py-2 px-4 rounded-lg border text-gray-700 border-gray-300 hover:bg-gray-100 transition"
            >
              ← Back to products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
