import React, { createContext, useContext, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  store: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

// Mock products database
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    price: 12.5,
    originalPrice: 15.0,
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    category: "Ferragens",
    rating: 4.8,
    reviews: 45,
    inStock: true,
  },
  {
    id: 2,
    name: "Cabo Flexível 2,5mm",
    price: 45.9,
    image: "/placeholder.svg",
    store: "Elétrica Central",
    category: "Elétricos",
    rating: 4.9,
    reviews: 23,
    inStock: true,
  },
  {
    id: 3,
    name: "Detergente Concentrado 1L",
    price: 8.9,
    image: "/placeholder.svg",
    store: "Casa Limpa",
    category: "Limpeza",
    rating: 4.7,
    reviews: 67,
    inStock: true,
  },
  {
    id: 4,
    name: "Furadeira de Impacto 650W",
    price: 189.9,
    originalPrice: 220.0,
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    category: "Ferragens",
    rating: 4.6,
    reviews: 156,
    inStock: true,
  },
  {
    id: 5,
    name: "Caixa de Papelão 30x30x20",
    price: 3.2,
    image: "/placeholder.svg",
    store: "Embalagens Pro",
    category: "Embalagens",
    rating: 4.5,
    reviews: 34,
    inStock: true,
  },
  {
    id: 6,
    name: "Filtro de Óleo Automotivo",
    price: 25.9,
    image: "/placeholder.svg",
    store: "Auto Peças Center",
    category: "Autopeças",
    rating: 4.7,
    reviews: 89,
    inStock: true,
  },
];

interface SearchContextType {
  searchQuery: string;
  searchResults: Product[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  searchProducts: (query: string) => void;
  clearSearch: () => void;
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: number) => Product | undefined;
  getAllProducts: () => Product[];
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const results = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.store.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()),
    );

    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const getProductsByCategory = (category: string) => {
    return mockProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase(),
    );
  };

  const getProductById = (id: number) => {
    return mockProducts.find((product) => product.id === id);
  };

  const getAllProducts = () => {
    return mockProducts;
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        setSearchQuery,
        searchProducts,
        clearSearch,
        getProductsByCategory,
        getProductById,
        getAllProducts,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
