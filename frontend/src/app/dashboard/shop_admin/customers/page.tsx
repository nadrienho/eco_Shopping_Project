"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ManageCustomers() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    // Fetch all customers
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/customers/", {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });

        console.log("Response status:", res.status); // Log the response status

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error response:", errorData); // Log the error response
          throw new Error("Failed to fetch customers");
        }

        const data = await res.json();
        console.log("Fetched customers:", data); // Log the fetched data
        setCustomers(data.customers);
        setTotalCustomers(data.total_customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    console.log("Session data:", session); // Log session data
    console.log("User role:", session?.user?.role); // Log user role

    if (session?.user?.role === "shop_admin") {
      fetchCustomers();
    }
  }, [session]);

  const toggleCustomerStatus = async (userId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/customers/${userId}/block_restore/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to update customer status");
      }

      const data = await res.json();
      alert(data.message);

      // Refresh the customer list
      const updatedCustomers = customers.map((customer) =>
        customer.id === userId ? { ...customer, is_active: !customer.is_active } : customer
      );
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error("Error updating customer status:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Heading Section */}
      <div className="bg-blue-600 rounded-lg p-8 shadow-lg">
        <h1 className="text-5xl font-extrabold mb-4 text-white">Manage Customers</h1>
        <p className="text-2xl font-semibold text-blue-100">Total Customers: {totalCustomers}</p>
      </div>

      {/* Customers Table */}
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
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                } hover:bg-gray-200`}
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