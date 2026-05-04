// src/components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Role } from "@/types/roles";
// Adding Lucide icons for a cleaner look, or stick to emojis
import { ChevronLeft, ChevronRight } from "lucide-react"; 

interface SidebarProps {
  role: Role;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuOptions: Record<Role, { label: string; href: string; icon: string }[]> = {
  shop_admin: [
    { label: "Dashboard", href: "/dashboard/shop_admin", icon: "📊" },
    { label: "Manage Customers", href: "/dashboard/shop_admin/customers", icon: "👥" },
    { label: "Manage Vendors", href: "/dashboard/shop_admin/vendors", icon: "🛍️" },
    { label: "Manage Products", href: "/dashboard/shop_admin/products", icon: "📦" },
    { label: "System Settings", href: "/dashboard/shop_admin/settings", icon: "⚙️" },
  ],
  vendor: [
    { label: "Dashboard", href: "/dashboard/vendor", icon: "📊" },
    { label: "Product Management", href: "/dashboard/vendor/products", icon: "🛍️" },
    { label: "Stock Management", href: "/dashboard/vendor/stock", icon: "📦" },
    { label: "Order Management", href: "/dashboard/vendor/orders", icon: "📋" },
    { label: "Certifications", href: "/dashboard/vendor/certifications", icon: "✅" },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard/customer", icon: "🏠" },
    { label: "Browse Products", href: "/dashboard/customer/browse", icon: "🛒" },
    { label: "Saved Items", href: "/dashboard/customer/saved", icon: "❤️" },
    { label: "My Orders", href: "/dashboard/customer/orders", icon: "📋" },
    { label: "My Cart", href: "/dashboard/customer/browse/cart", icon: "🛒" },
  ],
};

export default function Sidebar({ role, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const currentMenuItems = menuOptions[role] || [];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col py-8 z-40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-100 shadow-sm z-50 text-gray-500"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2 flex-1 px-4 overflow-x-hidden">
        {currentMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={isCollapsed ? item.label : ""}
            className={`py-2 px-3 rounded-lg transition flex items-center gap-3 font-medium min-w-max ${
              isActive(item.href)
                ? "bg-green-600 text-white"
                : "text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            <span className="text-xl flex-shrink-0 w-6 text-center">{item.icon}</span>
            <span className={`transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className={`border-t border-gray-200 pt-4 px-4 overflow-hidden`}>
        <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition`}>
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {session?.user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}