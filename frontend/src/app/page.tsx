import ProductCard from "@/components/ProductCard";

// 1. Define the Fetching Logic
async function getProducts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  try {
    const res = await fetch(`${apiUrl}/api/products/`, {
      cache: "no-store", 
    });

    if (!res.ok) {
      console.error("Django API Error:", res.status);
      return [];
    }

    const data = await res.json();

    /**
     * DEFENSIVE CHECK:
     * If Django has pagination enabled, data will be { results: [...] }
     * If not, it will be [...]
     */
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
      return data.results;
    }

    return []; // Return empty array if data is weird
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

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
          {/* We add a secondary check here just to be safe */}
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed">
              <p className="text-gray-500">No products found. Add some in the Django Admin!</p>
              <p className="text-xs text-gray-400 mt-2">Check: http://127.0.0.1:8000/api/products/</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}