// frontend/src/components/ProductCard.tsx

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    eco_score: number;
    category: { name: string } | null;
  };
}

export default function ProductCard({ product }: ProductProps) {
  // Logic to determine color based on Eco-Score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded">
            {product.category?.name || "General"}
          </span>
          <span className="text-lg font-bold text-gray-900">${product.price}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {product.description}
        </p>
        
        <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getScoreColor(product.eco_score)}`}>
          <span className="text-sm font-bold">Eco-Score: {product.eco_score}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
        <button className="w-full text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
          View Sustainability Details →
        </button>
      </div>
    </div>
  );
}