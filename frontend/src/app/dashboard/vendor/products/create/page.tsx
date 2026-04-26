"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  
  // Sustainability Fields
  const [materialType, setMaterialType] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [energyUsage, setEnergyUsage] = useState("");
  const [longevity, setLongevity] = useState("");
  const [weight, setWeight] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
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
          Authorization: `Bearer ${session.user.access_token}`,
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
        throw new Error(data.message || data.detail || "Failed to create product");
      }

      setMessage("✅ Product successfully added!");
      // Reset form
      setName(""); setDescription(""); setPrice(""); setStock("");
      setCategory(""); setMaterialType(""); setTransportMode("");
      setEnergyUsage(""); setLongevity(""); setWeight("");
    } catch (error: any) {
      setMessage(error.message || "A network error occurred.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white shadow-lg mb-6">
        <h1 className="text-2xl font-bold">Add New Eco-Product</h1>
        <p className="text-green-100 text-sm">Fill in the details to list your sustainable product.</p>
      </div>

      {message && (
        <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" required />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Quantity</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-gray-600" required>
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Sustainability Data */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Material Type</label>
          <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" required>
            <option value="">Select Material</option>
            <option value="recycled_polyester">Recycled Polyester</option>
            <option value="virgin_polyester">Virgin Polyester</option>
            <option value="organic_cotton">Organic Cotton</option>
            <option value="conventional_cotton">Conventional Cotton</option>
            <option value="linen">Linen</option>
            <option value="hemp">Hemp</option>
            <option value="wool">Wool</option>
            <option value="nylon">Nylon</option>
            <option value="silk">Silk</option>
            <option value="recycled_cardboard">Recycled Cardboard</option>
            <option value="virgin_paper">Virgin Paper</option>
            <option value="recycled_plastic_pet">Recycled Plastic (PET)</option>
            <option value="virgin_plastic_pet">Virgin Plastic (PET)</option>
            <option value="bioplastic_pla">Bioplastic (PLA)</option>
            <option value="glass">Glass</option>
            <option value="aluminum_recycled">Recycled Aluminum</option>
            <option value="aluminum_virgin">Virgin Aluminum</option>
            <option value="copper">Copper</option>
            <option value="steel">Steel</option>
            <option value="lithium_ion_battery">Lithium Ion Battery</option>
            <option value="bamboo">Bamboo</option>
            <option value="cork">Cork</option>
            <option value="hardwood_timber">Hardwood Timber</option>
            <option value="concrete">Concrete</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Transport Mode</label>
          <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" required>
            <option value="">Select Mode</option>
            <option value="sea">Sea Freight</option>
            <option value="truck">Land Transport</option>
            <option value="air">Air Freight</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Energy Usage (kWh)</label>
          <input type="number" step="0.1" value={energyUsage} onChange={(e) => setEnergyUsage(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Longevity (Years)</label>
          <input type="number" value={longevity} onChange={(e) => setLongevity(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Weight (kg)</label>
          <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none" required />
        </div>

        <div className="md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 shadow-md transition-all active:scale-[0.98]">
            Create Product Listing
          </button>
        </div>
      </form>
    </div>
  );
}