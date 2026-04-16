"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// 1. Define the Category interface to stop the 'never' type error
interface Category {
  id: number;
  name: string;
}

export default function CreateProduct() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  
  // 2. Properly type the categories state
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [message, setMessage] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [energyUsage, setEnergyUsage] = useState("");
  const [longevity, setLongevity] = useState("");
  const [weight, setWeight] = useState("");

  // 3. Define the base URL using your environment variable for deployment
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    if (session?.user?.access_token) {
      fetchCategories();
    }
  }, [session, API_BASE_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!session?.user?.access_token) {
        setMessage("Session expired. Please log in again.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/products/create/`, {
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
                material_type: materialType,
                transport_mode: transportMode,
                energy_usage: parseFloat(energyUsage),
                longevity: parseInt(longevity),
                weight: parseFloat(weight), 
            }),
        });

        const data = await res.json();

        if (!res.ok) {
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
        setMaterialType("");
        setTransportMode("");
        setEnergyUsage("");
        setLongevity("");
        setWeight("");

    } catch (error: any) {
        console.error("Fetch Error:", error);
        setMessage(error.message || "A network error occurred.");
    }
};

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Create Product</h1>
      {message && (
        <p className={`mb-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... existing fields for Name, Description, Price, Stock ... */}
        {/* Simplified for brevity, but keep your existing input structure */}
        
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-green-300 rounded-lg p-2"
            required
          />
        </div>
        
        {/* (Add back your other input fields here...) */}

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-green-300 rounded-lg p-2"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {/* TypeScript now knows 'cat' is a Category and has an 'id' */}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ... existing select/input fields for Material Type, Transport, etc. ... */}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full font-bold"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}