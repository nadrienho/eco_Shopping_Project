// src/components/DashboardHeader.tsx
"use client";

import { Menu, Search, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

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

  // Get initials
  const initials =
    session?.user?.username
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

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
          <h1 className="text-lg font-bold text-green-600">EcoShop</h1>
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <form onSubmit={handleSearch} className="flex-1 max-w-xl ">
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

        </div>
        

        {/* User Profile Dropdown */}
        <div className="hidden md:flex items-center gap-3 relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="User menu"
          >
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </span>
            <ChevronDown className="text-gray-500" size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session?.user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {session?.user?.role || ""}
                </p>
              </div>
              <a
                href="/dashboard/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
              >
                Profile
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
