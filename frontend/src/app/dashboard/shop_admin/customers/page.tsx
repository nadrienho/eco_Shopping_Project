"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// 1. Define the Customer interface
interface Customer {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export default function ManageCustomers() {
  const { data: session } = useSession();
  
  // 2. Type your state so TypeScript knows what's inside the array
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // 3. Use NEXT_PUBLIC_API_URL instead of localhost for deployment
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;
        const res = await fetch(`${apiUrl}/api/customers/`, {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch customers");

        const data = await res.json();
        // Ensure you are accessing the correct key from your Django response
        setCustomers(data.customers || []);
        setTotalCustomers(data.total_customers || 0);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    // Check for 'admin' or 'shop_admin' depending on your unified Role type
    if (session?.user?.role === "admin" || session?.user?.role === "shop_admin") {
      fetchCustomers();
    }
  }, [session]);

  const toggleCustomerStatus = async (userId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`;
      const res = await fetch(`${apiUrl}/api/customers/${userId}/block_restore/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to update customer status");

      const data = await res.json();
      alert(data.message);

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === userId ? { ...customer, is_active: !customer.is_active } : customer
        )
      );
    } catch (error) {
      console.error("Error updating customer status:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-5xl font-extrabold mb-4 text-white">Manage Customers</h1>
        <p className="text-2xl font-semibold text-blue-100">Total Customers: {totalCustomers}</p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 shadow">
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
            {customers.map((customer, index) => (
              <tr
                key={customer.id}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"} hover:bg-gray-200`}
              >
                <td className="border-b py-3 px-4 text-gray-800">{customer.username}</td>
                <td className="border-b py-3 px-4 text-gray-800">{customer.email}</td>
                <td className="border-b py-3 px-4 text-gray-800">
                  {customer.is_active ? "Active" : "Blocked"}
                </td>
                <td className="border-b py-3 px-4">
                  <button
                    onClick={() => toggleCustomerStatus(customer.id)}
                    className={`px-4 py-2 rounded ${
                      customer.is_active
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {customer.is_active ? "Block" : "Restore"}
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