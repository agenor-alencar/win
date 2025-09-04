import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  User,
  Home,
  Grid3X3,
  Package,
} from "lucide-react";
import { useSearch } from "../../contexts/SearchContext";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const {
    searchQuery,
    setSearchQuery,
    searchProducts,
    searchResults,
    isSearching,
  } = useSearch();
  const { state, addItem } = useCart();
  const { success } = useNotification();

  // Filter states
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Apply filters to search results
  const filteredResults = useMemo(() => {
    let filtered = [...searchResults];

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange
        .split("-")
        .map((p) => (p === "+" ? Infinity : parseFloat(p)));
      filtered = filtered.filter((product) => {
        const price =
          typeof product.price === "string"
            ? parseFloat(product.price.replace("R$ ", "").replace(",", "."))
            : product.price;
        if (max === undefined) return price >= min;
        return price >= min && price <= max;
      });
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA =
            typeof a.price === "string"
              ? parseFloat(a.price.replace("R$ ", "").replace(",", "."))
              : a.price;
          const priceB =
            typeof b.price === "string"
              ? parseFloat(b.price.replace("R$ ", "").replace(",", "."))
              : b.price;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA =
            typeof a.price === "string"
              ? parseFloat(a.price.replace("R$ ", "").replace(",", "."))
              : a.price;
          const priceB =
            typeof b.price === "string"
              ? parseFloat(b.price.replace("R$ ", "").replace(",", "."))
              : b.price;
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
      // Keep original order for relevance
    }

    return filtered;
  }, [searchResults, sortBy, priceRange, selectedCategory]);

  // Get unique categories from results
  const availableCategories = useMemo(() => {
    const categories = [...new Set(searchResults.map((p) => p.category))];
    return categories.sort();
  }, [searchResults]);

  useEffect(() => {
    if (query && query !== searchQuery) {
      setSearchQuery(query);
      searchProducts(query);
    }
  }, [query, searchQuery, setSearchQuery, searchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
      window.history.replaceState(
        {},
        "",
        `/search?q=${encodeURIComponent(searchQuery)}`,
      );
    }
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      store: product.store,
      inStock: product.inStock,
    });
    success(
      "Produto adicionado!",
      `${product.name} foi adicionado ao carrinho`,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:block">Voltar</span>
              </Link>
              <h1 className="text-xl font-bold">Buscar</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {state.itemCount}
                  </Badge>
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos, lojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
                autoFocus
              />
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="mb-6">
          {query && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Resultados para "{query}"</h2>
                <p className="text-muted-foreground">
                  {isSearching
                    ? "Buscando..."
                    : `${filteredResults.length} de ${searchResults.length} produtos encontrados`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        {searchResults.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Mais relevantes</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="rating">Melhor avaliados</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os preços</SelectItem>
                  <SelectItem value="0-10">Até R$ 10</SelectItem>
                  <SelectItem value="10-50">R$ 10 - R$ 50</SelectItem>
                  <SelectItem value="50-100">R$ 50 - R$ 100</SelectItem>
                  <SelectItem value="100-200">R$ 100 - R$ 200</SelectItem>
                  <SelectItem value="200+">Acima de R$ 200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availableCategories.length > 0 && (
              <div className="flex-1">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Buscando produtos...</span>
          </div>
        )}

        {/* Results Grid */}
        {!isSearching && filteredResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    {product.originalPrice && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {Math.round(
                          (1 - product.price / product.originalPrice) * 100,
                        )}
                        % OFF
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {product.rating}
                      <span className="mx-1">({product.reviews})</span>
                      <span className="mx-2">•</span>
                      {product.store}
                    </div>
                  </Link>
                  <div className="space-y-1">
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isSearching && searchResults.length === 0 && query && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Tente buscar com outras palavras-chave ou navegue pelas categorias
            </p>
            <Button asChild>
              <Link to="/categories">Ver Categorias</Link>
            </Button>
          </div>
        )}

        {/* No Query */}
        {!query && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              O que você está procurando?
            </h3>
            <p className="text-muted-foreground">
              Digite algo na barra de busca para encontrar produtos
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/categories"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1">Categorias</span>
          </Link>
          <Link
            to="/cart"
            className="flex flex-col items-center justify-center text-muted-foreground relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Carrinho</span>
            <Badge className="absolute top-1 right-4 h-4 w-4 flex items-center justify-center p-0 text-xs">
              {state.itemCount}
            </Badge>
          </Link>
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Pedidos</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Conta</span>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
