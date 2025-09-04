import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useSearch } from "../../contexts/SearchContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  MapPin,
  Clock,
  Truck,
  Shield,
  User,
  Home,
  Grid3X3,
  Package,
} from "lucide-react";

const product = {
  id: 1,
  name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
  price: "R$ 12,50",
  originalPrice: "R$ 15,00",
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  store: {
    name: "Ferragens Silva",
    rating: 4.8,
    reviews: 234,
    location: "Centro, São Paulo",
    distance: "2,3 km",
  },
  rating: 4.8,
  reviews: 45,
  description:
    "Parafusos Phillips de alta qualidade, ideais para fixação em madeira e metal. Fabricados em aço carbono com tratamento anticorrosivo. Perfeitos para móveis, construção civil e projetos de marcenaria.",
  specifications: [
    { label: "Material", value: "Aço carbono" },
    { label: "Tamanho", value: "3x20mm" },
    { label: "Tipo", value: "Phillips" },
    { label: "Acabamento", value: "Zincado" },
    { label: "Quantidade", value: "100 unidades" },
  ],
  category: "Ferragens",
  inStock: true,
  stockQuantity: 150,
};

const reviews = [
  {
    id: 1,
    user: "João Silva",
    rating: 5,
    date: "2024-01-15",
    comment: "Excelente qualidade! Chegou rapidinho e bem embalado.",
  },
  {
    id: 2,
    user: "Maria Santos",
    rating: 4,
    date: "2024-01-10",
    comment: "Produto conforme descrição. Recomendo!",
  },
  {
    id: 3,
    user: "Pedro Costa",
    rating: 5,
    date: "2024-01-08",
    comment: "Muito bom, já comprei várias vezes nesta loja.",
  },
];

export default function Product() {
  const { id } = useParams();
  const { addItem, state } = useCart();
  const { getProductById } = useSearch();
  const { success, info } = useNotification();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const productData = getProductById(Number(id));

  if (!productData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button asChild>
            <Link to="/">Voltar à Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Use the product from context but keep the static structure for demo
  const product = {
    ...productData,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    store: {
      name: productData.store,
      rating: 4.8,
      reviews: 234,
      location: "Centro, São Paulo",
      distance: "2,3 km",
    },
    description:
      "Produto de alta qualidade, ideal para suas necessidades. Fabricado com materiais resistentes e duráveis.",
    specifications: [
      { label: "Material", value: "Alta qualidade" },
      { label: "Garantia", value: "12 meses" },
      { label: "Origem", value: "Nacional" },
    ],
    category: productData.category,
    inStock: productData.inStock,
    stockQuantity: 150,
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      store: product.store.name,
      inStock: product.inStock,
      quantity,
    });
    success(
      "Produto adicionado!",
      `${quantity}x ${product.name} adicionado ao carrinho`,
    );
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      store: product.store.name,
      inStock: product.inStock,
      quantity,
    });
    info("Redirecionando para o carrinho...", "Produto adicionado com sucesso");
    setTimeout(() => {
      window.location.href = "/cart";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/categories" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:block">Voltar</span>
              </Link>
              <h1 className="text-lg font-semibold truncate max-w-xs">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {state.itemCount}
                  </Badge>
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.originalPrice && (
                <Badge className="absolute top-4 left-4 bg-red-500">
                  {Math.round(
                    (1 -
                      product.price /
                        (product.originalPrice || product.price)) *
                      100,
                  )}
                  % OFF
                </Badge>
              )}
            </div>

            {/* Image Thumbnails */}
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {product.rating} ({product.reviews} avaliações)
                </div>
                <div className="flex items-center">
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                </span>
              )}
              <div className="text-3xl font-bold text-primary">
                R$ {product.price.toFixed(2).replace(".", ",")}
              </div>
              {product.originalPrice && (
                <p className="text-sm text-green-600">
                  Você economiza R${" "}
                  {(product.originalPrice - product.price)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-center min-w-12">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {product.stockQuantity} unidades disponíveis
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleBuyNow}>
                Comprar Agora
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Truck className="h-4 w-4 mr-2 text-green-600" />
                  <span>Frete grátis na primeira compra</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Entrega em até 2 horas</span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Garantia de qualidade WIN</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Store Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{product.store.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {product.store.rating} ({product.store.reviews} avaliações)
                    <span className="mx-2">•</span>
                    <MapPin className="h-3 w-3 mr-1" />
                    {product.store.location} • {product.store.distance}
                  </div>
                </div>
              </div>
              <Button variant="outline">Ver Loja</Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Description */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Descrição do Produto</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Especificações</h3>
            <div className="space-y-3">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span className="text-muted-foreground">{spec.label}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">
              Avaliações ({product.reviews})
            </h3>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.user}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                  {index < reviews.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver todas as avaliações
            </Button>
          </CardContent>
        </Card>
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
