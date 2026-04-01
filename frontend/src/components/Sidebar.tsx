"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type Role = "admin" | "vendor" | "customer";

const menuOptions: Record<Role, { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Product Management", href: "/dashboard/admin/products" },
    { label: "Review Management", href: "/dashboard/admin/reviews" },
    { label: "User Management", href: "/dashboard/admin/users" },
  ],
  vendor: [
    { label: "Dashboard", href: "/dashboard/vendor" },
    { label: "My Products", href: "/dashboard/vendor/products" },
    { label: "Stock Management", href: "/dashboard/vendor/stock" },
    { label: "Certifications", href: "/dashboard/vendor/certifications" },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard/customer" },
    { label: "Browse Products", href: "/dashboard/customer/browse" },
    { label: "Saved Items", href: "/dashboard/customer/saved" },
    { label: "My Orders", href: "/dashboard/customer/orders" },
  ],
};

export default function Sidebar({ role }: { role: Role }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4">
      {/* Logo */}
      <div className="mb-8 text-green-700 font-bold text-2xl flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">♻️</span>
        </div>
        EcoShop
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2 flex-1">
        {menuOptions[role].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`py-2 px-4 rounded-lg transition flex items-center gap-3 font-medium ${
              isActive(item.href)
                ? "bg-green-600 text-white"
                : "text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Profile Section (Bottom) */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer group">
          {/* Profile Picture */}
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {session?.user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>

          {/* Username and Role */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.username || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {session?.user?.role || "customer"}
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}