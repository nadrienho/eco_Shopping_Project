"use client";

import { Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

// 1. Move all your logic into a separate inner component
function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams(); // This is the line that causes the build error
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const roleRedirects: Record<string, string> = {
        customer: "/dashboard/customer",
        vendor: "/dashboard/vendor",
        admin: "/dashboard/shop_admin", // Changed to match your sidebar key
      };

      const redirectUrl = roleRedirects[session.user.role] || "/dashboard/customer";
      router.push(redirectUrl);
    }
  }, [status, session, router]);

  const errorParam = searchParams.get("error");
  useEffect(() => {
    if (errorParam) {
      setError("Invalid credentials. Please try again.");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (result?.error) setError("Invalid username or password");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ... (Keep your existing Header and Login Card JSX here) ... */}
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">♻️</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Eco-Shop</h1>
            </div>
            <p className="text-gray-600">Sustainable shopping made simple</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-red-900">Login Failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:from-green-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="text-center text-sm text-gray-600 mt-6">
            <p>Don't have an account? <Link href="/register" className="font-semibold text-green-600">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Wrap the content in Suspense for the actual page export
export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin text-4xl">⏳</div>
        </div>
    }>
      <LoginContent />
    </Suspense>
  );
}