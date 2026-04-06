"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function CreateProduct() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        console.log("Access token:", session?.user?.access_token);

        const res = await fetch("http://127.0.0.1:8000/api/categories/", {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        console.log("Fetched categories:", data);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (session?.user) {
      fetchCategories();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    if (!session?.user?.access_token) {
        setMessage("Session expired. Please log in again.");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/api/products/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.user.access_token}`,
            },
            body: JSON.stringify({
                name,
                description,
                price: parseFloat(price), 
                stock: parseInt(stock),
                category: parseInt(category), 
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            // Log the actual error from the backend to the console
            console.error("Backend Error:", data);
            throw new Error(data.message || data.detail || "Failed to create product");
        }

        setMessage("Product successfully added!");
        // Reset form
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setCategory("");

    } catch (error: any) {
        console.error("Fetch Error:", error);
        setMessage(error.message || "A network error occurred.");
    }
};

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Create Product</h1>
      {message && <p className={`mb-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}