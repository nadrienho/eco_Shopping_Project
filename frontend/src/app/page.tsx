import ProductCard from "@/components/ProductCard";

// 1. Define the Fetching Logic
async function getProducts() {
  // We use the environment variable NEXT_PUBLIC_API_URL set in .env.local
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  const res = await fetch(`${apiUrl}/api/products/`, {
    cache: "no-store", // This ensures we always get the latest Eco-Scores from Django
  });

  if (!res.ok) {
    // This will activate the closest error.js file in your app directory
    throw new Error("Failed to fetch products from Django");
  }

  return res.json();
}

// 2. The Main Page Component
export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-green-900">Eco-Shop</h1>
          <p className="text-gray-600 mt-2">Discover products with a lower carbon footprint.</p>
        </header>

        {/* 3. Grid Layout for Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
            <p className="text-gray-500">No products found. Add some in the Django Admin!</p>
          </div>
        )}
      </div>
    </main>
  );
}