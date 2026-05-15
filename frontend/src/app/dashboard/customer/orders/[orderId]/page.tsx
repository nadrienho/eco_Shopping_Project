"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface OrderItem {
  id: number;
  product?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: number;
  items: OrderItem[];
}

interface ReviewFormState {
  rating: number;
  comment: string;
  open: boolean;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { data: session } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForms, setReviewForms] = useState<Record<number, ReviewFormState>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      const token = session?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/view/${orderId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      setOrder(data);
      setLoading(false);
    };

    if (session) fetchOrder();
  }, [orderId, session]);

  const toggleReviewForm = (itemId: number) => {
    setReviewForms((prev) => ({
      ...prev,
      [itemId]: {
        rating: prev[itemId]?.rating || 5,
        comment: prev[itemId]?.comment || "",
        open: !prev[itemId]?.open,
      },
    }));
  };

  const setRating = (itemId: number, rating: number) => {
    setReviewForms((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rating,
      },
    }));
  };

  const setComment = (itemId: number, comment: string) => {
    setReviewForms((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comment,
      },
    }));
  };

  const submitReview = async (item: OrderItem) => {
    const form = reviewForms[item.id];

    if (!form || !form.rating || !form.comment.trim()) {
      alert("Please select a rating and write a review.");
      return;
    }

    const token = session?.accessToken;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: item.product ?? item.id,
          order: order?.id,
          rating: form.rating,
          comment: form.comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(
          data.non_field_errors?.[0] ||
            data.rating?.[0] ||
            data.comment?.[0] ||
            "Failed to submit review."
        );
        return;
      }

      alert("Review submitted!");

      setReviewForms((prev) => ({
        ...prev,
        [item.id]: {
          rating: 5,
          comment: "",
          open: false,
        },
      }));
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8 text-red-500">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-4 text-white shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-6">Order #{order.id} Details</h1>
      </div>

      {order.items.map((item) => {
        const form = reviewForms[item.id];

        return (
          <div key={item.id} className="border-b border-gray-200 py-4">
            <div className="flex items-center">
              <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-4xl">🌿</span>
                )}
              </div>

              <div className="flex-1 px-6">
                <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
              </div>

              <button
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                onClick={() => toggleReviewForm(item.id)}
              >
                Leave Review
              </button>
            </div>

            {form?.open && (
              <div className="mt-4 ml-30 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-gray-800 mb-2">Your rating</p>

                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(item.id, star)}
                      className={`text-3xl ${
                        star <= form.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label className="block font-semibold text-gray-800 mb-2">
                  Your review
                </label>

                <textarea
                  value={form.comment}
                  onChange={(e) => setComment(item.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => submitReview(item)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Submit Review
                  </button>

                  <button
                    onClick={() => toggleReviewForm(item.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
