import React, { createContext, useContext, useState, useCallback, useRef } from "react";

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

interface SearchCache {
  [key: string]: {
    data: Product[];
    timestamp: number;
  };
}

interface SearchContextType {
  searchQuery: string;
  searchResults: Product[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  searchProducts: (query: string) => void;
  clearSearch: () => void;
  clearCache: () => void;
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: number) => Product | undefined;
  getAllProducts: () => Product[];
}

const SearchContext = createContext<SearchContextType | null>(null);

// Tempo de cache em milissegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchCache = useRef<SearchCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para verificar se o cache é válido
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Função para limpar cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    Object.keys(searchCache.current).forEach((key) => {
      if (!isCacheValid(searchCache.current[key].timestamp)) {
        delete searchCache.current[key];
      }
    });
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Cancela requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Verifica cache primeiro
    const cacheKey = `search:${query.toLowerCase()}`;
    const cachedResult = searchCache.current[cacheKey];
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      setSearchResults(cachedResult.data);
      return;
    }

    setIsSearching(true);

    // Cria novo AbortController para esta requisição
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`, {
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }
      
      const data: Product[] = await response.json();

      // Salva no cache
      searchCache.current[cacheKey] = {
        data,
        timestamp: Date.now(),
      };

      setSearchResults(data);
      
      // Limpa cache expirado periodicamente
      cleanExpiredCache();
    } catch (error: any) {
      // Ignora erros de abort
      if (error.name === "AbortError") {
        return;
      }
      console.error("Erro ao buscar produtos:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  }, [cleanExpiredCache]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    
    // Cancela requisição em andamento
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearCache = useCallback(() => {
    searchCache.current = {};
  }, []);

  const getProductsByCategory = useCallback(async (category: string) => {
    // Verifica cache primeiro
    const cacheKey = `category:${category}`;
    const cachedResult = searchCache.current[cacheKey];
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      return cachedResult.data;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/category/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos por categoria: ${response.status}`);
      }
      const data: Product[] = await response.json();
      
      // Salva no cache
      searchCache.current[cacheKey] = {
        data,
        timestamp: Date.now(),
      };
      
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar produtos por categoria:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getProductById = useCallback(async (id: number) => {
    // Verifica cache primeiro
    const cacheKey = `product:${id}`;
    const cachedResult = searchCache.current[cacheKey];
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      return cachedResult.data[0]; // Cache armazena array, retorna primeiro item
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produto por ID: ${response.status}`);
      }
      const data: Product = await response.json();
      
      // Salva no cache
      searchCache.current[cacheKey] = {
        data: [data],
        timestamp: Date.now(),
      };
      
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar produto por ID:", error);
      return undefined;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getAllProducts = useCallback(async () => {
    // Verifica cache primeiro
    const cacheKey = "all-products";
    const cachedResult = searchCache.current[cacheKey];
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      return cachedResult.data;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar todos os produtos: ${response.status}`);
      }
      const data: Product[] = await response.json();
      
      // Salva no cache
      searchCache.current[cacheKey] = {
        data,
        timestamp: Date.now(),
      };
      
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar todos os produtos:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        setSearchQuery,
        searchProducts,
        clearSearch,
        clearCache,
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
