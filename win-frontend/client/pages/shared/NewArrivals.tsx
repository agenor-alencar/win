import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  SortAsc,
  Star,
  Heart,
  Clock,
  Sparkles,
  ShoppingCart,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Header from "../../components/Header";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  store: string;
  rating: number;
  reviews: number;
  category: string;
  arrivalDate: string;
  isNew: boolean;
  isTrending: boolean;
  stock: number;
}

const newProducts: Product[] = [
  {
    id: 1,
    name: "Furadeira de Impacto Sem Fio 20V",
    price: 399.9,
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.9,
    reviews: 45,
    category: "Ferramentas",
    arrivalDate: "2024-01-15",
    isNew: true,
    isTrending: true,
    stock: 25,
  },
  {
    id: 2,
    name: "Kit Brocas Titânio 13 Peças",
    price: 89.9,
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.8,
    reviews: 32,
    category: "Ferramentas",
    arrivalDate: "2024-01-14",
    isNew: true,
    isTrending: false,
    stock: 18,
  },
  {
    id: 3,
    name: "Parafusadeira Elétrica com Maleta",
    price: 159.9,
    image: "/placeholder.svg",
    store: "Elétrica Central",
    rating: 4.7,
    reviews: 28,
    category: "Ferramentas",
    arrivalDate: "2024-01-14",
    isNew: true,
    isTrending: true,
    stock: 12,
  },
  {
    id: 4,
    name: "Tinta Acrílica Premium 3.6L",
    price: 129.9,
    image: "/placeholder.svg",
    store: "Casa & Cor",
    rating: 4.6,
    reviews: 19,
    category: "Tintas",
    arrivalDate: "2024-01-13",
    isNew: true,
    isTrending: false,
    stock: 30,
  },
  {
    id: 5,
    name: "Serra Tico-Tico 650W com Guia",
    price: 299.9,
    image: "/placeholder.svg",
    store: "Ferramentas Express",
    rating: 4.8,
    reviews: 67,
    category: "Ferramentas",
    arrivalDate: "2024-01-12",
    isNew: true,
    isTrending: true,
    stock: 8,
  },
  {
    id: 6,
    name: "Chave de Fenda Isolada 1000V",
    price: 45.9,
    image: "/placeholder.svg",
    store: "Elétrica Pro",
    rating: 4.9,
    reviews: 41,
    category: "Ferramentas",
    arrivalDate: "2024-01-12",
    isNew: true,
    isTrending: false,
    stock: 22,
  },
  {
    id: 7,
    name: "Morsa de Bancada 4 Polegadas",
    price: 179.9,
    image: "/placeholder.svg",
    store: "Ferragens Central",
    rating: 4.7,
    reviews: 35,
    category: "Ferramentas",
    arrivalDate: "2024-01-11",
    isNew: true,
    isTrending: false,
    stock: 15,
  },
  {
    id: 8,
    name: 'Alicate Universal Isolado 8"',
    price: 69.9,
    image: "/placeholder.svg",
    store: "Ferramentas Silva",
    rating: 4.8,
    reviews: 53,
    category: "Ferramentas",
    arrivalDate: "2024-01-11",
    isNew: true,
    isTrending: true,
    stock: 20,
  },
];

const categories = [
  "Todos",
  "Ferramentas",
  "Tintas",
  "Elétricos",
  "Ferragens",
  "Casa & Jardim",
];

const timeFilters = [
  { key: "all", label: "Todos" },
  { key: "today", label: "Hoje" },
  { key: "week", label: "Esta Semana" },
  { key: "month", label: "Este Mês" },
];

export default function NewArrivals() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedTime, setSelectedTime] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  const { addItem } = useCart();
  const { success } = useNotification();

  const filteredProducts = newProducts
    .filter(
      (product) =>
        selectedCategory === "Todos" || product.category === selectedCategory,
    )
    .filter((product) => {
      if (selectedTime === "all") return true;
      const today = new Date();
      const productDate = new Date(product.arrivalDate);
      const daysDiff = Math.floor(
        (today.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (selectedTime === "today") return daysDiff === 0;
      if (selectedTime === "week") return daysDiff <= 7;
      if (selectedTime === "month") return daysDiff <= 30;
      return true;
    })
    .filter((product) => !showTrendingOnly || product.isTrending)
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime()
        );
      }
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      store: product.store,
    });
    success(
      "Produto adicionado ao carrinho!",
      `${product.name} foi adicionado com sucesso.`,
    );
  };

  const getDaysAgo = (dateString: string) => {
    const today = new Date();
    const productDate = new Date(dateString);
    const daysDiff = Math.floor(
      (today.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) return "Hoje";
    if (daysDiff === 1) return "Ontem";
    return `${daysDiff} dias atrás`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            ✨ Novidades WIN
          </h1>
          <p className="text-xl lg:text-2xl mb-6 text-blue-100">
            Descubra os produtos que acabaram de chegar
          </p>
          <Badge className="bg-white/20 text-white text-lg px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            {newProducts.length} novos produtos esta semana
          </Badge>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          {/* Time Filters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Período</h3>
            <div className="flex flex-wrap gap-2">
              {timeFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={selectedTime === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories and Options */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Trending Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="trending"
                  checked={showTrendingOnly}
                  onChange={(e) => setShowTrendingOnly(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="trending" className="text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Apenas em Alta
                </label>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-white text-sm"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="price-low">Menor Preço</option>
                  <option value="price-high">Maior Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} novos produtos encontrados
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <Link to={`/product/${product.id}`}>
                <div className="relative cursor-pointer">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />

                  {/* New Badge */}
                  {product.isNew && (
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Novo
                    </Badge>
                  )}

                  {/* Trending Badge */}
                  {product.isTrending && (
                    <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Em Alta
                    </Badge>
                  )}

                  {/* Arrival Date */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {getDaysAgo(product.arrivalDate)}
                  </div>
                </div>
              </Link>

              {/* Favorite Button - Outside of Link to prevent navigation */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-12 bg-white/80 hover:bg-white z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart className="h-4 w-4" />
              </Button>

              <CardContent className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  {product.rating} ({product.reviews})
                  <span className="mx-2">•</span>
                  {product.store}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.stock} em estoque
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Chegou em {formatDate(product.arrivalDate)}
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Carregar Mais Produtos
          </Button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Seja o Primeiro a Saber!</h3>
          <p className="mb-4 text-blue-100">
            Receba notificações sobre os novos produtos que chegam
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-2 rounded-md text-gray-900"
            />
            <Button variant="secondary">Notificar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
