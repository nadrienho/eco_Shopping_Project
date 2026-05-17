// src/components/DashboardHeader.tsx
"use client";

import { Menu, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

interface DashboardHeaderProps {
  onSearch: (results: any[]) => void;
  onOpenSidebar: () => void;
}

export default function DashboardHeader({
  onSearch,
  onOpenSidebar,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      onSearch([]);
      return;
    }

    try {
      const token = session?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/?search=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        onSearch(data);
      } else if (Array.isArray(data.results)) {
        onSearch(data.results);
      } else {
        onSearch([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      onSearch([]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-16 px-4 md:px-8 flex items-center gap-4">
        {/* Hamburger Button */}
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="p-2 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition"
        >
          <Menu size={26} />
        </button>

        {/* Brand / Title */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-green-600">EcoShop Dashboard</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-auto">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </form>

        {/* User */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {session?.user?.username || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {session?.user?.role || ""}
            </p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
