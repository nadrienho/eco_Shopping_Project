"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";

// 1. Define the interface (or import it if you move it to a types file)
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  eco_score?: number;
}

export default function SearchContainer() {
  // 2. Replace <any[]> with <Product[]>
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  return (
    <>
      <SearchBar onSearch={setSearchResults} />
      <SearchResults results={searchResults} />
    </>
  );
}