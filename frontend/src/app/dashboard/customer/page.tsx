"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Search state
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "customer") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return null;
  }
  if (status !== "authenticated") {
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setSearchResults([]); // Optional: clear previous results
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/?search=${encodeURIComponent(search)}`);
  const data = await res.json();
  setSearchResults(data.results || []);
  alert(`Searching for: ${search}`);
};

  return (
    <>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search for products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Search
        </button>
      </form>
      {/* Render search results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Search Results:</h2>
          <ul className="space-y-2">
            {searchResults.map((product: any) => (
              <li key={product.id} className="p-4 bg-white border rounded shadow">
                <div className="font-bold">{product.name}</div>
                <div className="text-gray-600">{product.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Eco-Shop Admin</h1>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium ml-2">
          ⚙️ Administrator
        </span>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
          className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Logout
        </button>
      </div>
      {/* ...rest of your admin dashboard content... */}
    </>
  );
}