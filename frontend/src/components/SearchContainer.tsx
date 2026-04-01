"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";

export default function SearchContainer() {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <>
      <SearchBar onSearch={setSearchResults} />
      <SearchResults results={searchResults} />
    </>
  );
}