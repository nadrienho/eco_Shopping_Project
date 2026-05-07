"use client";

import { signOut, useSession } from "next-auth/react";
import SearchBar from "./SearchBar";
import Link from "next/link";

interface DashboardHeaderProps {
  onSearch: (results: Product[]) => void;
}

export default function DashboardHeader({ onSearch }: DashboardHeaderProps) {

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-500 shadow-md sticky top-0 z-40">
      <div className="px-8 py-4 flex items-center justify-between gap-6">
        {/* Logo & Website Name - Left */}
        <Link href="/dashboard/customer" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl">♻️</span>
          </div>
          <span className="text-white font-bold text-xl">Eco-Shop</span>
        </Link>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-md">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* User Info & Logout - Right */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm flex items-center gap-2"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}