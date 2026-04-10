"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [postage, setPostage] = useState(5.0); // Example postage cost
  const router = useRouter();

  useEffect(() => {
    // Load cart data from localStorage or API
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Calculate totals
  const itemsTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const orderTotal = itemsTotal + postage;

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
    // Clear the cart after placing the order
    localStorage.removeItem("cart");
    router.push("/dashboard/customer/orders"); // Redirect to orders page
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Details */}
      <div className="bg-white space-y-4 p-8 rounded-xl shadow-lg">
        <div className="p-4 rounded-lg shadow">
          <h2 className="text-lg text-black-900 font-bold mb-4">Order Summary</h2>
          {cart.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2"
            >
              <div>
                <h3 className="text-black-900 font-semibold">{item.product.name}</h3>
                <p className="text-black-600">
                  ${item.product.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <p className="text-black-900 font-bold">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Items Total</p>
            <p className="text-gray-900 font-bold">${itemsTotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Postage & Packing</p>
            <p className="text-gray-900 font-bold">${postage.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center border-t border-gray-300 pt-4 mt-4">
            <p className="text-lg font-bold">Order Total</p>
            <p className="text-lg font-bold text-green-600">${orderTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}