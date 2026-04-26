"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// 1. Define the Vendor interface to stop the "type never" error
interface Vendor {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export default function ManageVendors() {
  const { data: session } = useSession();
  
  // 2. Properly type the state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // 3. Use Environment Variable for production
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;
        const res = await fetch(`${baseUrl}/api/vendors/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch vendors");

        const data = await res.json();
        // Adjust the data key if your Django backend uses a different name
        setVendors(data.vendors || []);
        setTotalVendors(data.total_vendors || 0);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    // Use "admin" or "shop_admin" based on your unified Role type
    if (session?.user?.role === "shop_admin" || session?.user?.role === "admin") {
      fetchVendors();
    }
  }, [session]);

  const toggleVendorStatus = async (userId: number) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;
      const res = await fetch(`${baseUrl}/api/vendors/${userId}/block_restore/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update vendor status");

      const data = await res.json();
      alert(data.message);

      // 4. Update state safely
      setVendors((prevVendors) =>
        prevVendors.map((vendor) =>
          vendor.id === userId ? { ...vendor, is_active: !vendor.is_active } : vendor
        )
      );
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-5xl font-extrabold mb-4 text-white">Manage Vendors</h1>
        <p className="text-2xl font-semibold text-blue-100">Total Vendors: {totalVendors}</p>
      </div>

      <div className="bg-gray-300 p-6 rounded-lg border border-gray-300 shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-300">
              <th className="border-b py-3 px-4 text-black font-semibold">Username</th>
              <th className="border-b py-3 px-4 text-black font-semibold">Email</th>
              <th className="border-b py-3 px-4 text-black font-semibold">Status</th>
              <th className="border-b py-3 px-4 text-black font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr
                key={vendor.id}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"} hover:bg-gray-200`}
              >
                <td className="border-b py-3 px-4 text-gray-800">{vendor.username}</td>
                <td className="border-b py-3 px-4 text-gray-800">{vendor.email}</td>
                <td className="border-b py-3 px-4 text-gray-800">
                  {vendor.is_active ? "Active" : "Blocked"}
                </td>
                <td className="border-b py-3 px-4">
                  <button
                    onClick={() => toggleVendorStatus(vendor.id)}
                    className={`px-4 py-2 rounded ${
                      vendor.is_active
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {vendor.is_active ? "Block" : "Restore"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}