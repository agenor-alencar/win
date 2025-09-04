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
  Flame,
  Zap,
  Gift,
  Tag,
  ShoppingCart,
} from "lucide-react";
import Header from "../../components/Header";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";

interface Deal {
  id: number;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  image: string;
  store: string;
  rating: number;
  reviews: number;
  timeLeft: string;
  category: string;
  type: "flash" | "daily" | "clearance" | "limited";
  stock: number;
}

const deals: Deal[] = [
  {
    id: 1,
    name: "Parafuso Phillips Kit 100pçs",
    originalPrice: 89.9,
    salePrice: 45.9,
    discount: 49,
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.8,
    reviews: 245,
    timeLeft: "2h 15m",
    category: "Ferragens",
    type: "flash",
    stock: 12,
  },
  {
    id: 2,
    name: "Furadeira Black & Decker 500W",
    originalPrice: 299.9,
    salePrice: 199.9,
    discount: 33,
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.6,
    reviews: 189,
    timeLeft: "1 dia",
    category: "Ferramentas",
    type: "daily",
    stock: 8,
  },
  {
    id: 3,
    name: "Tinta Látex Branca 18L",
    originalPrice: 189.9,
    salePrice: 129.9,
    discount: 32,
    image: "/placeholder.svg",
    store: "Casa & Cor",
    rating: 4.7,
    reviews: 156,
    timeLeft: "3 dias",
    category: "Tintas",
    type: "clearance",
    stock: 25,
  },
  {
    id: 4,
    name: "Kit Chaves Fenda e Phillips",
    originalPrice: 59.9,
    salePrice: 29.9,
    discount: 50,
    image: "/placeholder.svg",
    store: "Ferragens Central",
    rating: 4.9,
    reviews: 332,
    timeLeft: "45m",
    category: "Ferramentas",
    type: "flash",
    stock: 5,
  },
  {
    id: 5,
    name: "Cabo Flexível 2,5mm 100m",
    originalPrice: 159.9,
    salePrice: 99.9,
    discount: 38,
    image: "/placeholder.svg",
    store: "Elétrica Express",
    rating: 4.5,
    reviews: 98,
    timeLeft: "2 dias",
    category: "Elétricos",
    type: "limited",
    stock: 15,
  },
  {
    id: 6,
    name: "Lâmpada LED Kit 10 unidades",
    originalPrice: 89.9,
    salePrice: 49.9,
    discount: 44,
    image: "/placeholder.svg",
    store: "LED Center",
    rating: 4.8,
    reviews: 267,
    timeLeft: "6h 30m",
    category: "Elétricos",
    type: "daily",
    stock: 30,
  },
];

const categories = [
  "Todos",
  "Ferragens",
  "Ferramentas",
  "Elétricos",
  "Tintas",
  "Limpeza",
];

const dealTypes = [
  { key: "all", label: "Todas", icon: Gift },
  { key: "flash", label: "Flash", icon: Zap },
  { key: "daily", label: "Do Dia", icon: Clock },
  { key: "clearance", label: "Liquidação", icon: Tag },
  { key: "limited", label: "Limitada", icon: Flame },
];

export default function Deals() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("discount");
  const { addItem } = useCart();
  const { success } = useNotification();

  const filteredDeals = deals
    .filter(
      (deal) =>
        selectedCategory === "Todos" || deal.category === selectedCategory,
    )
    .filter((deal) => selectedType === "all" || deal.type === selectedType)
    .sort((a, b) => {
      if (sortBy === "discount") return b.discount - a.discount;
      if (sortBy === "price") return a.salePrice - b.salePrice;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const handleAddToCart = (deal: Deal) => {
    addItem({
      id: deal.id,
      name: deal.name,
      price: deal.salePrice,
      quantity: 1,
      image: deal.image,
      store: deal.store,
    });
    success(
      "Produto adicionado ao carrinho!",
      `${deal.name} foi adicionado com sucesso.`,
    );
  };

  const getDealTypeInfo = (type: Deal["type"]) => {
    switch (type) {
      case "flash":
        return { label: "Flash", color: "bg-red-500", icon: Zap };
      case "daily":
        return { label: "Do Dia", color: "bg-blue-500", icon: Clock };
      case "clearance":
        return { label: "Liquidação", color: "bg-green-500", icon: Tag };
      case "limited":
        return { label: "Limitada", color: "bg-purple-500", icon: Flame };
      default:
        return { label: "Oferta", color: "bg-gray-500", icon: Gift };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            🔥 Ofertas Imperdíveis
          </h1>
          <p className="text-xl lg:text-2xl mb-6 text-red-100">
            Descontos de até 50% em produtos selecionados
          </p>
          <Badge className="bg-white/20 text-white text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            Ofertas por tempo limitado
          </Badge>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          {/* Deal Types */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Tipo de Oferta</h3>
            <div className="flex flex-wrap gap-2">
              {dealTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.key}
                    variant={selectedType === type.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.key)}
                    className="flex items-center"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Categories and Sort */}
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

            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white"
              >
                <option value="discount">Maior Desconto</option>
                <option value="price">Menor Preço</option>
                <option value="rating">Melhor Avaliação</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredDeals.length} ofertas encontradas
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => {
            const typeInfo = getDealTypeInfo(deal.type);
            const TypeIcon = typeInfo.icon;

            return (
              <Card
                key={deal.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <Link to={`/product/${deal.id}`}>
                  <div className="relative cursor-pointer">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* Deal Type Badge */}
                    <Badge
                      className={`absolute top-2 left-2 ${typeInfo.color} text-white`}
                    >
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeInfo.label}
                    </Badge>

                    {/* Discount Badge */}
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-lg font-bold">
                      -{deal.discount}%
                    </Badge>

                    {/* Time Left */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {deal.timeLeft}
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
                  <Link to={`/product/${deal.id}`}>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                      {deal.name}
                    </h3>
                  </Link>

                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {deal.rating} ({deal.reviews})
                    <span className="mx-2">•</span>
                    {deal.store}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        R$ {deal.salePrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        R$ {deal.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Apenas {deal.stock} restantes
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(deal);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Carregar Mais Ofertas
          </Button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Não Perca Nenhuma Oferta!</h3>
          <p className="mb-4 text-blue-100">
            Receba as melhores promoções direto no seu email
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-2 rounded-md text-gray-900"
            />
            <Button variant="secondary">Cadastrar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
