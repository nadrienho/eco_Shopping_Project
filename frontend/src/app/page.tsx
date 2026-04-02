"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

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
            <span className="text-2xl font-bold text-gray-900">Eco-Shop</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-700 hover:text-green-600 transition">
              Features
            </Link>
            <Link href="#products" className="text-gray-700 hover:text-green-600 transition">
              Products
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-green-600 transition">
              About
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard/customer"
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
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Shop Sustainably,{" "}
          <span className="text-green-600">Make a Difference</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover eco-friendly products with transparent environmental impact data.
          Combat greenwashing with real sustainability metrics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg"
          >
            Get Started
          </Link>
          <Link
            href="/browse"
            className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-semibold text-lg"
          >
            Browse Products
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Why Choose Eco-Shop?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Transparent Data
              </h3>
              <p className="text-gray-600">
                Real environmental impact metrics for every product. No greenwashing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Eco-Certified
              </h3>
              <p className="text-gray-600">
                All products verified for sustainability. Certifications included.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Easy Shopping
              </h3>
              <p className="text-gray-600">
                Simple search and filtering by eco-score and carbon footprint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section id="products" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Featured Products
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sample Product Card */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition">
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🌿</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Eco Product {i}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sustainable and environmentally friendly product.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">$29.99</span>
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    Eco Score: 85
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/register"
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Eco-Shop</h4>
              <p className="text-gray-400">Sustainable shopping made simple.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="text-gray-400 space-y-2">
                <li><Link href="#" className="hover:text-green-400">Features</Link></li>
                <li><Link href="#" className="hover:text-green-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="text-gray-400 space-y-2">
                <li><Link href="#" className="hover:text-green-400">About</Link></li>
                <li><Link href="#" className="hover:text-green-400">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="text-gray-400 space-y-2">
                <li><Link href="#" className="hover:text-green-400">Privacy</Link></li>
                <li><Link href="#" className="hover:text-green-400">Terms</Link></li>
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