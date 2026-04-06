"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type Role = "shop_admin" | "vendor" | "customer";

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
    { label: "My Products", href: "/dashboard/vendor/products", icon: "🛍️" },
    { label: "Stock Management", href: "/dashboard/vendor/stock", icon: "📦" },
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

export default function Sidebar({ role }: { role: Role }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  console.log("Sidebar rendering with role:", role);
  console.log("Menu items:", menuOptions[role]);

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4">

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
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
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