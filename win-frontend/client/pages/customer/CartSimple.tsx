import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
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
];

export default function CartSimple() {
  const { state, updateQuantity, removeItem } = useCart();
  const { items, total, itemCount } = state;
  const [couponCode, setCouponCode] = useState("");
  const { success, info, warning } = useNotification();

  const subtotal = total;

  const handleQuantityUpdate = (
    id: number,
    newQuantity: number,
    productName: string,
  ) => {
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem) return;

    updateQuantity(id, newQuantity);

    if (newQuantity > currentItem.quantity) {
      info("Quantidade atualizada", `${productName} - Qtd: ${newQuantity}`);
    } else if (newQuantity < currentItem.quantity && newQuantity > 0) {
      info("Quantidade atualizada", `${productName} - Qtd: ${newQuantity}`);
    }
  };

  const handleRemoveItem = (id: number, productName: string) => {
    removeItem(id);
    warning("Produto removido", `${productName} foi removido do carrinho`);
  };

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
                {itemCount} {itemCount === 1 ? "item" : "itens"}
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

            {/* Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Produtos no Carrinho</h3>
              {items.map((item) => (
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
                                  handleQuantityUpdate(
                                    item.id,
                                    item.quantity - 1,
                                    item.name,
                                  )
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
                                  handleQuantityUpdate(
                                    item.id,
                                    item.quantity + 1,
                                    item.name,
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() =>
                                handleRemoveItem(item.id, item.name)
                              }
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
                <div className="flex space-x-2">
                  <Input
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline">Aplicar</Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Resumo do Pedido</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({items.length}{" "}
                      {items.length === 1 ? "item" : "itens"})
                    </span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>

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

                <Button size="lg" className="w-full" asChild>
                  <Link to="/checkout">Finalizar Compra ({items.length})</Link>
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
              {itemCount}
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
