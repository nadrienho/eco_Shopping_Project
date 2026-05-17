// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Role } from "@/types/roles";
import { X } from "lucide-react";


interface SidebarProps {
  role: Role;
  open: boolean;
  onClose: () => void;
}

const menuOptions: Record<Role, { label: string; href: string; icon: string }[]> = {
  shop_admin: [
    { label: "Dashboard", href: "/dashboard/shop_admin", icon: "📊" },
    { label: "Manage Customers", href: "/dashboard/shop_admin/customers", icon: "👥" },
    { label: "Manage Vendors", href: "/dashboard/shop_admin/vendors", icon: "🛍️" },
    { label: "Manage Products", href: "/dashboard/shop_admin/products", icon: "📦" },
    { label: "Manage Categories", href: "/dashboard/shop_admin/categories", icon: "📂" },
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

export default function Sidebar({ role, open, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const currentMenuItems = menuOptions[role] || [];

  return (
    <>
      {/* Dark overlay behind sidebar */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-900">Menu</h2>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 flex-1 px-4 py-5 overflow-y-auto">
          {currentMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`py-2.5 px-3 rounded-lg transition flex items-center gap-3 font-medium ${
                isActive(item.href)
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-green-100 hover:text-green-700"
              }`}
            >
              <span className="text-xl flex-shrink-0 w-6 text-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {session?.user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.username || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {role}
              </p>
              <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition"
              >
                  Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
