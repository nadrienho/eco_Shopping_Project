"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import router from "next/dist/shared/lib/router/router";

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await res.json();
        setCart(data.cart);
      } catch (err) {
        setError("Failed to load cart");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchCart();
    }
  }, [session]);

  // Update cart item quantity
  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/update/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: newQuantity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update cart item quantity");
      }

      // Update the cart state locally
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      alert("Failed to update cart item quantity.");
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/clear/`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
        },
        });

        if (!res.ok) {
        throw new Error("Failed to clear cart on the backend");
        }

        // Clear the cart locally
        localStorage.removeItem("cart");
        setCart([]);
    } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Failed to clear the cart. Please try again.");
    }
  }
    

  // Calculate total balance
  const totalBalance = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

//   const handlePayment = () => {
//     alert("Payment functionality is not implemented yet!");
//   };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">My Cart</h1>

      {/* Loading State */}
      {loading && <p>Loading cart...</p>}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* Cart Items */}
      {!loading && cart.length > 0 && (
        <div className="space-y-4">
          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
            >
              <div>
                <h3 className="text-lg font-bold text-green-600">{item.product.name}</h3>
                <p className="text-gray-600">
                  Unit Price: ${item.product.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-2 py-1 bg-red-500 text-green-800 rounded hover:bg-red-600 disabled:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="text-gray-900 font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-2 py-1 bg-green-500 text-green-800 rounded hover:bg-green-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-gray-900 font-bold">
                Total: ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          {/* Total Balance */}
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">Total Balance</h3>
            <p className="text-gray-900 font-bold">${totalBalance.toFixed(2)}</p>
          </div>

          {/* Move to checkout page*/}
          <button
            onClick={() => router.push("/dashboard/customer/browse/cart/checkout")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Proceed to Checkout
          </button>

          {/* Clear Cart Button */}
          <button
            onClick={clearCart}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Clear Cart
          </button>
        </div>
      )}

      {/* Empty Cart */}
      {!loading && cart.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-600 text-lg">Your cart is empty</p>
          <p className="text-gray-500 text-sm mt-2">Add some products to your cart</p>
        </div>
      )}
    </div>
  );
}