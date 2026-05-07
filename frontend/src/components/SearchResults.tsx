"use client";

// 1. Define the interface (or import it if you created a central types file)
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  eco_score?: number;
}

interface SearchResultsProps {
  // 2. Replace any[] with Product[]
  results: Product[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Search Results:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 3. Remove : any from the map parameter */}
        {results.map((product) => (
          <div key={product.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-green-600 font-semibold">£{product.price}</span>
              {product.eco_score !== undefined && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Eco Score: {product.eco_score}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}