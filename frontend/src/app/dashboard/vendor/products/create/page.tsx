"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Category {
  id: number;
  name: string;
}

export default function CreateProduct() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    materialType: "",
    transportMode: "",
    energyUsage: "",
    longevity: "",
    weight: "",
  });

  // 🖼️ Image upload state
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories/`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]);

  // Handle form text/number changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!session?.user?.access_token) {
      setMessage("Session expired. Please log in again.");
      return;
    }

    try {
      // Use FormData for file upload
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("material_type", formData.materialType);
      data.append("transport_mode", formData.transportMode);
      data.append("energy_usage", formData.energyUsage);
      data.append("longevity", formData.longevity);
      data.append("weight", formData.weight);
      data.append("status", "pending");

      if (image) {
        data.append("image", image);
      }

      const res = await fetch(`${API_BASE_URL}/api/products/create/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.access_token}`,
        },
        body: data,
      });

      const result = await res.json();
      console.log(result);

      if (!res.ok) throw new Error(result.error || "Failed to create product");

      setMessage("✅ Product successfully added!");
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        materialType: "",
        transportMode: "",
        energyUsage: "",
        longevity: "",
        weight: "",
      });
      setImage(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Failed to create product.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white shadow-lg mb-6">
        <h1 className="text-2xl font-bold">Add New Eco-Product</h1>
        <p className="text-green-100 text-sm">Upload your sustainable product with details and photos.</p>
      </div>

      {message && (
        <div
          className={`p-4 mb-4 rounded-lg text-sm font-medium ${
            message.includes("successfully")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Fields */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-gray-700" required />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-green-500 outline-none text-gray-700" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price (£)</label>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-300 rounded-lg p-2 bg-white" required />
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="Preview" className="rounded-md border w-32 h-32 object-cover" />
            </div>
          )}
        </div>

        {/* Sustainability Fields */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Material Type</label>

          <select
            name="materialType"
            value={formData.materialType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
            required
          >
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
          <select name="transportMode" value={formData.transportMode} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required>
            <option value="">Select</option>
            <option value="sea">Sea</option>
            <option value="truck">Truck</option>
            <option value="air">Air</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Energy Usage (kWh)</label>
          <input type="number" name="energyUsage" step="0.1" value={formData.energyUsage} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Longevity (Years)</label>
          <input type="number" name="longevity" value={formData.longevity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Weight (kg)</label>
          <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-gray-700" required />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 mt-4">
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}
