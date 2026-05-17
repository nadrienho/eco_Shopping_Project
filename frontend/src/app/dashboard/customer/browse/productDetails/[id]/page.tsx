"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Router from "next/router";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  vendor_name?: string;
  category_name?: string;
  eco_score?: number;
  image: string;
  reviews?: Review[];
  average_rating?: number;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken;

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
    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      if (isInCart) {
        router.push("/dashboard/customer/browse/cart");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 "    >
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
      <div className="mt-8 border-t pt-6 hover:shadow-lg transition-shadow rounded-lg p-4 bg-gray-50 w-full">
              <h2 className="text-xl font-bold mb-4 text-green-600">Reviews</h2>
              {product.average_rating !== undefined && (
              <div className="flex items-center gap-2 mt-8">
                <span className="font-semibold text-gray-700">Average Rating:</span>
                <span className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(product.average_rating!) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.176 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
                    </svg>
                  ))}
                </span>
                <span className="ml-2 text-gray-600">{product.average_rating?.toFixed(1)}/5</span>
              </div>
              )}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-700">{review.user_name}:</span>
                        <span className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.176 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.97z" />
                            </svg>
                          ))}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
    </div>
  );
}