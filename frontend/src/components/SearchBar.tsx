"use client";

import { useState } from "react";

// 1. Define the Product interface to replace 'any'
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  eco_score?: number;
}

interface SearchBarProps {
  // 2. Change any[] to Product[]
  onSearch: (results: Product[]) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/?search=${encodeURIComponent(search)}`
      );
      
      if (!res.ok) throw new Error("Search request failed");
      
      const data = await res.json();
      
      // Ensure we pass the correct array type to onSearch
      onSearch(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      console.error("Search failed:", error);
      onSearch([]); // Reset results on error to prevent undefined states
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-3 py-1.5 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-90 text-black"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-1.5 bg-white text-green-600 rounded-lg font-semibold text-sm hover:bg-green-50 transition disabled:opacity-50"
      >
        {loading ? "..." : "Search"}
      </button>
    </form>
  );
}