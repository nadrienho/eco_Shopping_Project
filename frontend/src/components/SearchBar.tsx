"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (results: any[]) => void;
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
      const data = await res.json();
      onSearch(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
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
        className="flex-1 px-3 py-1.5 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-90"
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