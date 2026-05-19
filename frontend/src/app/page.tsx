// frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  image?: string | null;
  eco_score?: number;
  average_rating?: number;
  review_count?: number;
  co2_saved?: number;
}

export default function HomePage() {
  const { data: session } = useSession();

  const [featured, setFeatured] = useState<Product[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoadingFeatured(true);
      setFeaturedError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/featured/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load featured products.");
        }

        const data = await res.json();

        const normalizedData = Array.isArray(data) ? data : data.results || [];

        setFeatured(normalizedData);
      } catch (error) {
        console.error("Featured products error:", error);
        setFeaturedError("Could not load featured products right now.");
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const dashboardHref = session?.user?.role
    ? `/dashboard/${session.user.role}`
    : "/dashboard/customer";

  const browseHref = session ? "/dashboard/customer/browse" : "/login";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-green-50">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">♻️</span>
            </div>
            <span className="text-2xl font-bold text-green-600">Eco-Shop</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-700 hover:text-green-600 transition"
            >
              Features
            </Link>
            <Link
              href="#products"
              className="text-gray-700 hover:text-green-600 transition"
            >
              Products
            </Link>
            <Link
              href="#about"
              className="text-gray-700 hover:text-green-600 transition"
            >
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={dashboardHref}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold mb-6">
          Sustainable shopping with real impact data
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Shop Sustainably,{" "}
          <span className="text-green-600">Make a Difference</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover eco-friendly products with transparent environmental impact
          data. Combat greenwashing with real sustainability metrics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {session ? (
            <Link
              href={browseHref}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
            >
              Browse Products
            </Link>
          ) : (
            <Link
              href="/register"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
            >
              Get Started
            </Link>
          )}

          <Link
            href="#products"
            className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-semibold text-lg"
          >
            View Featured
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-green-50 border border-green-100">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                CO₂ Transparency
              </h3>
              <p className="text-gray-600">
                See product impact metrics like CO₂ saved, material footprint,
                and sustainability scores.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-green-50 border border-green-100">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verified Products
              </h3>
              <p className="text-gray-600">
                Shop admin approval helps reduce misleading sustainability
                claims before products go live.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-green-50 border border-green-100">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Featured Picks
              </h3>
              <p className="text-gray-600">
                Discover selected products highlighted by the Eco-Shop admin
                team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-semibold mb-2">
              Shop admin picks
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              These products are selected to highlight sustainable choices with
              clear environmental information.
            </p>
          </div>

          {loadingFeatured ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-6 bg-white rounded-lg border border-gray-200 shadow animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-4" />
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded-full w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center">
              {featuredError}
            </div>
          ) : featured.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No featured products yet
              </h3>
              <p className="text-gray-600">
                Featured products selected by the shop admin will appear here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  href={
                    session
                      ? `/dashboard/customer/browse/${product.id}`
                      : "/login"
                  }
                  className="group p-6 bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition block"
                >
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <span className="text-5xl">🌿</span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition">
                      {product.name}
                    </h3>

                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full whitespace-nowrap">
                      Featured
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description ||
                      "Sustainable and environmentally conscious product."}
                  </p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold text-lg">
                      £{Number(product.price).toFixed(2)}
                    </span>

                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Eco Score:{" "}
                      {typeof product.eco_score === "number"
                        ? product.eco_score.toFixed(0)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      ⭐{" "}
                      {typeof product.average_rating === "number"
                        ? product.average_rating.toFixed(1)
                        : "0.0"}{" "}
                      ({product.review_count || 0})
                    </span>

                    <span>
                      CO₂ saved:{" "}
                      {typeof product.co2_saved === "number"
                        ? `${product.co2_saved.toFixed(2)} kg`
                        : "N/A"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href={browseHref}
              className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">
            About Eco-Shop
          </h2>

          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-8">
            We believe sustainable shopping should be simple and transparent.
            Our mission is to help consumers make informed, eco-friendly choices
            by providing real environmental data for every product.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                3
              </div>
              <p className="text-gray-600">Featured products highlighted</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                CO₂
              </div>
              <p className="text-gray-600">Impact metrics shown clearly</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                5★
              </div>
              <p className="text-gray-600">Customer reviews supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Eco-Shop</h4>
              <p className="text-gray-400">
                Sustainable shopping made simple.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="text-gray-400 space-y-2">
                <li>
                  <Link href="#features" className="hover:text-green-400">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#products" className="hover:text-green-400">
                    Featured Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="text-gray-400 space-y-2">
                <li>
                  <Link href="#about" className="hover:text-green-400">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-green-400">
                    Join Eco-Shop
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="text-gray-400 space-y-2">
                <li>
                  <Link href="/login" className="hover:text-green-400">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-green-400">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Eco-Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
