"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const [postage, setPostage] = useState(5.0); // Example postage cost

  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const [address, setAddress] = useState({ 
    fullName: "",
    street: "",
    city: "",
    region: "",
    postCode: "",
    country: "",

  });
  const [deliveryOption, setDeliveryOption] = useState("standard"); // Default delivery option
  const [deliveryCost, setDeliveryCost] = useState(5.0); // Default delivery cost

  // Calculate totals
  const itemsTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const orderTotal = itemsTotal + deliveryCost;
  console.log("Items Total:", itemsTotal);
  console.log("Order Total:", orderTotal);

  const handlePlaceOrder = async () => {
    if (
      !address.fullName ||
      !address.street ||
      !address.city ||
      !address.region ||
      !address.postCode ||
      !address.country
    ) {
      alert("Please fill in all the address fields.");
      return;
    }

    const orderDetails = {
      address,
      deliveryOption,
      cart,
      totalCost: orderTotal,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(orderDetails),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();
      alert("Order placed successfully!");
      console.log("Order ID:", data.orderId);

      // Clear the cart after placing the order
      localStorage.removeItem("cart");
      router.push("/dashboard/customer/orders"); // Redirect to orders page
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order Details */}
      <div className="bg-white space-y-4 p-8 rounded-xl shadow-lg">
        <div className="p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-green-600">Order Summary</h2>
          {cart.length > 0 ? (
            cart.map((item, index) => (
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
            ))
          ) : (
            <p className="text-gray-600">Your cart is empty. Please add items to your cart.</p>
          )}
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

        {/* Shipping Address */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold mb-4 text-green-600">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Street Address"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Region"
              value={address.region}
              onChange={(e) => setAddress({ ...address, region: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Post Code"
              value={address.postCode}
              onChange={(e) => setAddress({ ...address, postCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Country"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Delivery Options */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold mb-4 text-green-600">Delivery Options</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery"
                value="standard"
                checked={deliveryOption === "standard"}
                onChange={(e) => {
                  setDeliveryOption(e.target.value);
                  setDeliveryCost(5.0); // Standard delivery cost
                }}
                className="mr-2"
              />
              Standard Delivery ($5.00)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery"
                value="express"
                checked={deliveryOption === "express"}
                onChange={(e) => {
                  setDeliveryOption(e.target.value);
                  setDeliveryCost(15.0); // Express delivery cost
                }}
                className="mr-2"
              />
              Express Delivery ($15.00)
            </label>
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