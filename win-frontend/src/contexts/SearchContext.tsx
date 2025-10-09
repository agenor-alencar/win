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

    try {
      // **CHAMADA DA API PARA O BACKEND**
      const response = await fetch(`/api/products?q=${query}`); // Use a URL relativa
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }
      const data: Product[] = await response.json(); // Garanta que o tipo corresponda

      setSearchResults(data);
    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error);
      // TODO: Implementar tratamento de erro adequado (exibir mensagem para o usuário)
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const getProductsByCategory = async (category: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/category/${category}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos por categoria: ${response.status}`);
      }
      const data: Product[] = await response.json();
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar produtos por categoria:", error);
      return []; // Retorna um array vazio em caso de erro
    } finally {
      setIsSearching(false);
    }
  };

  const getProductById = async (id: number) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produto por ID: ${response.status}`);
      }
      const data: Product = await response.json();
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar produto por ID:", error);
      return undefined; // Retorna undefined em caso de erro
    } finally {
      setIsSearching(false);
    }
  };

  const getAllProducts = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar todos os produtos: ${response.status}`);
      }
      const data: Product[] = await response.json();
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar todos os produtos:", error);
      return []; // Retorna um array vazio em caso de erro
    } finally {
      setIsSearching(false);
    }
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
