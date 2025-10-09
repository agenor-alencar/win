import { useState, useMemo } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  User,
  ArrowLeft,
  Filter,
  Star,
  Heart,
  Grid3X3,
  Home,
  Package,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotification } from "../../contexts/NotificationContext";

const products = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    price: 12.5,
    originalPrice: 15.0,
    priceString: "R$ 12,50",
    originalPriceString: "R$ 15,00",
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.8,
    reviews: 45,
    category: "ferragens",
  },
  {
    id: 2,
    name: "Porca Sextavada M8 - Galvanizada",
    price: 0.75,
    priceString: "R$ 0,75",
    image: "/placeholder.svg",
    store: "Parafusos & Cia",
    rating: 4.9,
    reviews: 23,
    category: "ferragens",
  },
  {
    id: 3,
    name: "Chave de Fenda 6mm - Cabo Emborrachado",
    price: 18.9,
    priceString: "R$ 18,90",
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.7,
    reviews: 67,
    category: "ferragens",
  },
  {
    id: 4,
    name: "Martelo de Unha 500g - Cabo de Madeira",
    price: 25.0,
    priceString: "R$ 25,00",
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.6,
    reviews: 89,
    category: "ferragens",
  },
  {
    id: 5,
    name: 'Dobradiça 3" Cromada - Par',
    price: 8.5,
    priceString: "R$ 8,50",
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.8,
    reviews: 34,
    category: "ferragens",
  },
  {
    id: 6,
    name: "Furadeira de Impacto 650W",
    price: 189.9,
    originalPrice: 220.0,
    priceString: "R$ 189,90",
    originalPriceString: "R$ 220,00",
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.9,
    reviews: 156,
    category: "ferragens",
  },
  {
    id: 7,
    name: "Alicate Universal 8 polegadas",
    price: 35.9,
    priceString: "R$ 35,90",
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.5,
    reviews: 78,
    category: "ferragens",
  },
  {
    id: 8,
    name: "Broca para Metal 6mm",
    price: 5.2,
    priceString: "R$ 5,20",
    image: "/placeholder.svg",
    store: "Parafusos & Cia",
    rating: 4.3,
    reviews: 42,
    category: "ferragens",
  },
  {
    id: 9,
    name: "Serra Tico-Tico 500W",
    price: 145.0,
    originalPrice: 180.0,
    priceString: "R$ 145,00",
    originalPriceString: "R$ 180,00",
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.7,
    reviews: 203,
    category: "ferragens",
  },
  {
    id: 10,
    name: "Parafusadeira 12V com Bateria",
    price: 89.9,
    priceString: "R$ 89,90",
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.6,
    reviews: 134,
    category: "ferragens",
  },
];

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: urlCategory } = useParams();
  const { success } = useNotification();

  // Filter products by URL category if specified
  const categoryFilteredProducts = useMemo(() => {
    if (!urlCategory || urlCategory === "all") return products;
    return products.filter(
      (product) => product.category.toLowerCase() === urlCategory.toLowerCase(),
    );
  }, [urlCategory]);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [priceRange, setPriceRange] = useState(
    searchParams.get("price") || "all",
  );
  const [selectedStore, setSelectedStore] = useState(
    searchParams.get("store") || "all",
  );
  const [minRating, setMinRating] = useState(
    parseFloat(searchParams.get("rating") || "0"),
  );

  // Get unique stores for filter dropdown
  const availableStores = useMemo(() => {
    const stores = [...new Set(categoryFilteredProducts.map((p) => p.store))];
    return stores.sort();
  }, [categoryFilteredProducts]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let filtered = [...categoryFilteredProducts];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.store.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange
        .split("-")
        .map((p) => (p === "+" ? Infinity : parseFloat(p)));
      filtered = filtered.filter((product) => {
        if (max === undefined) return product.price >= min;
        return product.price >= min && product.price <= max;
      });
    }

    // Store filter
    if (selectedStore !== "all") {
      filtered = filtered.filter((product) => product.store === selectedStore);
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((product) => product.rating >= minRating);
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
        filtered.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
    }

    return filtered;
  }, [
    categoryFilteredProducts,
    searchQuery,
    priceRange,
    selectedStore,
    minRating,
    sortBy,
  ]);

  // Update URL params when filters change
  const updateUrlParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "0") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateUrlParams("search", value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateUrlParams("sort", value);
  };

  const handlePriceChange = (value: string) => {
    setPriceRange(value);
    updateUrlParams("price", value);
  };

  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
    updateUrlParams("store", value);
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    updateUrlParams("rating", rating.toString());
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSortBy("relevance");
    setPriceRange("all");
    setSelectedStore("all");
    setMinRating(0);
    setSearchParams(new URLSearchParams());
    success("Filtros removidos", "Todos os filtros foram limpos");
  };

  const hasActiveFilters =
    searchQuery ||
    sortBy !== "relevance" ||
    priceRange !== "all" ||
    selectedStore !== "all" ||
    minRating > 0;

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
              <h1 className="text-xl font-bold text-primary">
                {urlCategory
                  ? urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1)
                  : "Ferragens"}
              </h1>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar em ferragens..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Link>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em ferragens..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Mais relevantes</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="rating">Melhor avaliados</SelectItem>
                  <SelectItem value="reviews">Mais avaliados</SelectItem>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={priceRange} onValueChange={handlePriceChange}>
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

            <div className="flex-1">
              <Select value={selectedStore} onValueChange={handleStoreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {availableStores.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select
                value={minRating.toString()}
                onValueChange={(value) => handleRatingChange(parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Avaliação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas as avaliações</SelectItem>
                  <SelectItem value="4">4+ estrelas</SelectItem>
                  <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                  <SelectItem value="4.8">4.8+ estrelas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} de {categoryFilteredProducts.length}{" "}
                produtos (
                {filteredProducts.length !== categoryFilteredProducts.length
                  ? "filtrados"
                  : "todos"}
                )
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredProducts.length} produtos encontrados
            {filteredProducts.length !== products.length &&
              ` de ${products.length} total`}
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <Link to={`/product/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
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
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
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
                      <div className="space-y-1">
                        {product.originalPriceString && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.originalPriceString}
                          </span>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {product.priceString}
                          </span>
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              success(
                                "Produto adicionado!",
                                `${product.name} foi adicionado ao carrinho`,
                              );
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Não encontramos produtos que correspondam aos seus filtros.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Limpar filtros
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Carregar mais produtos
          </Button>
        </div>
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
            className="flex flex-col items-center justify-center text-primary"
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
              3
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
