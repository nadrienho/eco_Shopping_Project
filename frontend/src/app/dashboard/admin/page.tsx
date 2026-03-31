"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return null;
  }
  if (status !== "authenticated") {
    return null;
  }

  return (
    <>
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