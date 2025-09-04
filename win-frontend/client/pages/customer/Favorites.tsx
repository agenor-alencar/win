import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  ShoppingCart,
  Trash2,
  Package,
  Grid3X3,
  User,
  Home,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import Header from "../../components/Header";

// Mock favorites data
const favoriteProducts = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    price: 12.5,
    originalPrice: 15.0,
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    rating: 4.8,
    reviews: 45,
    inStock: true,
  },
  {
    id: 4,
    name: "Furadeira de Impacto 650W",
    price: 189.9,
    originalPrice: 220.0,
    image: "/placeholder.svg",
    store: "Ferramentas Pro",
    rating: 4.6,
    reviews: 156,
    inStock: true,
  },
  {
    id: 2,
    name: "Cabo Flexível 2,5mm",
    price: 45.9,
    image: "/placeholder.svg",
    store: "Elétrica Central",
    rating: 4.9,
    reviews: 23,
    inStock: false,
  },
];

export default function Favorites() {
  const { state, addItem } = useCart();

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
    alert(`${product.name} adicionado ao carrinho!`);
  };

  const handleRemoveFavorite = (productId: number) => {
    // TODO: Implement remove favorite functionality
    console.log("Remove favorite:", productId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Favoritos</h1>
          <p className="text-muted-foreground">
            {favoriteProducts.length} produtos salvos
          </p>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>
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
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                    onClick={() => handleRemoveFavorite(product.id)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Indisponível</Badge>
                    </div>
                  )}
                </div>
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
                      <div className="flex space-x-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleRemoveFavorite(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs"
                          disabled={!product.inStock}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                        >
                          {product.inStock ? "Adicionar" : "Indisponível"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground mb-8">
              Salve produtos que você gosta para encontrá-los facilmente depois
            </p>
            <Button asChild size="lg">
              <Link to="/">Descobrir Produtos</Link>
            </Button>
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
            {state.itemCount > 0 && (
              <Badge className="absolute top-1 right-4 h-4 w-4 flex items-center justify-center p-0 text-xs">
                {state.itemCount}
              </Badge>
            )}
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
