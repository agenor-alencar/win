import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  Home,
  Grid3X3,
  Package,
  Tag,
  Truck,
  Gift,
} from "lucide-react";

const cartItems = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    price: 12.5,
    originalPrice: 15.0,
    quantity: 2,
    image: "/placeholder.svg",
    store: "Ferragens Silva",
    inStock: true,
  },
  {
    id: 2,
    name: "Cabo Flexível 2,5mm",
    price: 45.9,
    quantity: 1,
    image: "/placeholder.svg",
    store: "Elétrica Central",
    inStock: true,
  },
  {
    id: 3,
    name: "Detergente Concentrado 1L",
    price: 8.9,
    quantity: 3,
    image: "/placeholder.svg",
    store: "Casa Limpa",
    inStock: false,
  },
];

export default function Cart() {
  const [items, setItems] = useState(cartItems);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode.trim().toUpperCase());
      setCouponCode("");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = appliedCoupon ? subtotal * 0.1 : 0; // 10% discount example
  const delivery = 0; // Free delivery
  const total = subtotal - discount + delivery;

  const inStockItems = items.filter((item) => item.inStock);
  const outOfStockItems = items.filter((item) => !item.inStock);

  if (items.length === 0) {
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
                <h1 className="text-xl font-bold">Carrinho</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground mb-8">
            Adicione produtos incríveis e comece suas compras!
          </p>
          <Button asChild size="lg">
            <Link to="/">Começar a Comprar</Link>
          </Button>
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
              className="flex flex-col items-center justify-center text-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Carrinho</span>
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

        <div className="h-16 md:hidden" />
      </div>
    );
  }

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
              <h1 className="text-xl font-bold">Carrinho</h1>
              <Badge variant="secondary" className="ml-2">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Delivery Banner */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center text-green-700">
                  <Gift className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    Parabéns! Você tem frete grátis na primeira compra
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* In Stock Items */}
            {inStockItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Produtos Disponíveis</h3>
                {inStockItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.store}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              {item.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  R${" "}
                                  {item.originalPrice
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </span>
                              )}
                              <div className="text-lg font-bold text-primary">
                                R$ {item.price.toFixed(2).replace(".", ",")}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="px-3 py-1 text-sm min-w-12 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Out of Stock Items */}
            {outOfStockItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-muted-foreground">
                  Produtos Indisponíveis
                </h3>
                {outOfStockItems.map((item) => (
                  <Card key={item.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg grayscale"
                        />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.store}
                          </p>
                          <Badge variant="destructive">Indisponível</Badge>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-muted-foreground">
                              R$ {item.price.toFixed(2).replace(".", ",")}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Coupon */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Cupom de Desconto
                </h3>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <span className="font-medium text-green-700">
                        {appliedCoupon}
                      </span>
                      <p className="text-sm text-green-600">
                        10% de desconto aplicado
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-green-800"
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={applyCoupon} variant="outline">
                      Aplicar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Resumo do Pedido</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({inStockItems.length}{" "}
                      {inStockItems.length === 1 ? "item" : "itens"})
                    </span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({appliedCoupon})</span>
                      <span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-1 text-green-600" />
                      <span>Frete</span>
                    </div>
                    <span className="text-green-600 font-medium">GRÁTIS</span>
                  </div>

                  <hr className="my-4 border-border" />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  disabled={inStockItems.length === 0}
                  asChild
                >
                  <Link to="/checkout">
                    Finalizar Compra ({inStockItems.length})
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/">Continuar Comprando</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
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
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1">Categorias</span>
          </Link>
          <Link
            to="/cart"
            className="flex flex-col items-center justify-center text-primary relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Carrinho</span>
            <Badge className="absolute top-1 right-4 h-4 w-4 flex items-center justify-center p-0 text-xs">
              {items.length}
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
