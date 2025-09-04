import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Clock } from "lucide-react";
import { useSearch } from "../contexts/SearchContext";

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
}

const popularSearches = [
  "Parafusos",
  "Furadeira",
  "Cabo elétrico",
  "Ferramentas",
  "Martelo",
  "Chaves de fenda",
  "Alicate",
  "Pregos",
  "Dobradiças",
  "Fita isolante",
];

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  isVisible,
  onClose,
  onSelect,
}) => {
  const { getAllProducts } = useSearch();
  const [recentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("win-recent-searches");
    return saved ? JSON.parse(saved) : [];
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Get suggestions based on query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const allProducts = getAllProducts();
    const productSuggestions = allProducts
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.store.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);

    const textSuggestions = popularSearches
      .filter((search) => search.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);

    return { productSuggestions, textSuggestions };
  }, [query, getAllProducts]);

  const handleSuggestionClick = (suggestion: string) => {
    // Save to recent searches
    const newRecent = [
      suggestion,
      ...recentSearches.filter((s) => s !== suggestion),
    ].slice(0, 5);
    localStorage.setItem("win-recent-searches", JSON.stringify(newRecent));

    onSelect(suggestion);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-1"
    >
      <Card className="shadow-lg border">
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {query.trim() ? (
            <div className="space-y-1">
              {/* Text Suggestions */}
              {suggestions.textSuggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Buscas populares
                  </div>
                  {suggestions.textSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm flex items-center"
                    >
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Product Suggestions */}
              {suggestions.productSuggestions.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Produtos
                  </div>
                  {suggestions.productSuggestions.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="block px-3 py-2 hover:bg-muted rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-primary">
                              {typeof product.price === "string"
                                ? product.price
                                : `R$ ${product.price.toFixed(2).replace(".", ",")}`}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {product.store}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No results */}
              {suggestions.textSuggestions.length === 0 &&
                suggestions.productSuggestions.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum resultado encontrado</p>
                  </div>
                )}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Buscas recentes
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm flex items-center"
                    >
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              <div className="p-2 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Buscas populares
                </div>
                {popularSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm flex items-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
