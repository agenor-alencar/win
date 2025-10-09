import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Grid3X3,
  Package,
  Heart,
  Star,
  ShoppingCart,
  User,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import Header from "../../components/Header";

const categories = [
  { name: "Ferragens", icon: "🔧", color: "bg-blue-100 text-blue-700" },
  { name: "Elétricos", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
  { name: "Limpeza", icon: "🧽", color: "bg-green-100 text-green-700" },
  { name: "Embalagens", icon: "📦", color: "bg-purple-100 text-purple-700" },
  { name: "Autopeças", icon: "🚗", color: "bg-red-100 text-red-700" },
];

const featuredProducts = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm",
    price: "R$ 2,50",
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.8,
    discount: "-15%",
  },
  {
    id: 2,
    name: "Cabo Flexível 2,5mm",
    price: "R$ 45,90",
    image: "/placeholder.svg",
    store: "Elétrica Central",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Detergente Concentrado 1L",
    price: "R$ 8,90",
    image: "/placeholder.svg",
    store: "Casa Limpa",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Caixa de Papelão 30x30x20",
    price: "R$ 3,20",
    image: "/placeholder.svg",
    store: "Embalagens Pro",
    rating: 4.6,
  },
];

export default function Index() {
  const { state, addItem } = useCart();
  const { info, success } = useNotification();

  const handleAddToCart = (product: any) => {
    const price = parseFloat(
      product.price.replace("R$ ", "").replace(",", "."),
    );
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      quantity: 1,
      image: product.image,
      store: product.store,
    });
    success(
      "Produto adicionado ao carrinho!",
      `${product.name} foi adicionado com sucesso.`,
    );
  };

  useEffect(() => {
    // Show welcome notification on first visit
    const hasVisited = localStorage.getItem("win-has-visited");
    if (!hasVisited) {
      setTimeout(() => {
        info(
          "Bem-vindo ao WIN Marketplace!",
          "Encontre produtos locais com entrega rápida",
        );
        localStorage.setItem("win-has-visited", "true");
      }, 1500);
    }
  }, [info]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Encontre tudo que precisa
            </h2>
            <p className="text-lg lg:text-xl mb-8 text-blue-100">
              Produtos locais com entrega rápida e frete grátis na primeira
              compra
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Comece a Comprar
              </Button>
              <Link to="/sell">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Venda no WIN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8">Categorias</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {category.name}
                    </h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8">
            Produtos em Destaque
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
                    {product.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {product.discount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                      {product.name}
                    </h4>
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {product.rating}
                    <span className="mx-2">•</span>
                    {product.store}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-primary"
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
            to="/login"
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
