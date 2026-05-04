"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  eco_score?: number;
  category_name?: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
  isSaved?: boolean;
  isInCart?: boolean;
  onToggleSave?: () => void;
  onToggleCart?: () => void;
}

export default function ProductCard({
  product,
  isSaved = false,
  isInCart = false,
  onToggleSave,
  onToggleCart,
}: ProductCardProps) {
  const router = useRouter();

  const getEcoColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="relative bg-white rounded-lg shadow hover:shadow-lg transition  border border-gray-200">
      <div className="relative h-48 w-full cursor-pointer" onClick={() => router.push(`/dashboard/customer/browse/productDetails/${product.id}`)}>
        {/* Heart button */}
        
        <Image
          src={product.image || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover"

        />
      </div>
      

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          <p className="font-bold text-green-700 mt-2">£{product.price}</p>

          {product.eco_score !== undefined && (
            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded ${getEcoColor(
                product.eco_score
              )}`}
            >
              Eco: {product.eco_score}/100
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.();
          }}
          className="absolute top-3 left-3 p-2 rounded-full bg-white/90 shadow-md hover:bg-gray-100 transition border border-gray-300"
          aria-label={isSaved ? "Unsave product" : "Save product"}
        >
          {isSaved ? "❤️" : "🤍"}
        </button>

      {/* Cart button */}
      {onToggleCart && (
        <div className="flex justify-end p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCart();
            }}
            className={`py-2 px-4 text-sm font-semibold transition hover:scale-105 rounded ${
              isInCart
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isInCart ? "Remove from Cart" : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
