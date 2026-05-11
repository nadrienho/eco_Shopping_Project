"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Vendor {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export default function ManageVendors() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (session?.user?.role !== "shop_admin" || !token) return;

    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API}/api/vendors/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch vendors");

        const data = await res.json();
        setVendors(data.vendors || []);
        setTotalVendors(data.total_vendors || 0);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, [session, token, API]);

  const toggleVendorStatus = async (userId: number) => {
    try {
      const res = await fetch(`${API}/api/vendors/${userId}/block_restore/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update vendor status");

      const data = await res.json();
      alert(data.message);

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