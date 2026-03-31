import React from "react";
import Link from "next/link";

type Role = "shopadmin" | "vendor" | "customer";

interface SidebarProps {
  role: Role;
}

const menuOptions: Record<Role, { label: string; href: string }[]> = {
  shopadmin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Product Management", href: "/dashboard/products" },
    { label: "Review Management", href: "/dashboard/reviews" },
    { label: "User Management", href: "/dashboard/users" },
  ],
  vendor: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Products", href: "/dashboard/my-products" },
    { label: "Stock Management", href: "/dashboard/stock" },
    { label: "Certifications", href: "/dashboard/certifications" },
  ],
  customer: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Browse Products", href: "/dashboard/browse" },
    { label: "Saved Items", href: "/dashboard/saved" },
    { label: "My Orders", href: "/dashboard/orders" },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col py-8 px-4">
      <div className="mb-8 text-green-700 font-bold text-2xl">EcoShop</div>
      <nav className="flex flex-col gap-2">
        {menuOptions[role].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="py-2 px-4 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}