import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  MapPin,
  User,
  Lock,
  Truck,
  Gift,
  CheckCircle,
} from "lucide-react";

const orderItems = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    price: 12.5,
    quantity: 2,
    store: "Ferragens Silva",
  },
  {
    id: 2,
    name: "Cabo Flexível 2,5mm",
    price: 45.9,
    quantity: 1,
    store: "Elétrica Central",
  },
];

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const { success, info, error: notifyError } = useNotification();

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = subtotal * 0.1; // 10% discount
  const total = subtotal - discount;

  const handlePayment = async () => {
    setIsProcessing(true);
    info(
      "Processando pagamento...",
      "Aguarde enquanto confirmamos seu pagamento",
    );

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      success("Pagamento aprovado!", "Seu pedido foi confirmado com sucesso");

      // Redirect to order success page after notification
      setTimeout(() => {
        window.location.href = "/order-success/WIN2024001";
      }, 2000);
    }, 3000);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-green-600">
                Pedido Confirmado!
              </h1>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold mb-4">Pagamento Aprovado!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Seu pedido foi confirmado e será entregue em até 2 horas.
          </p>

          <Card className="text-left mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Número do Pedido:</span>
                  <span className="font-mono">#WIN2024001</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valor Total:</span>
                  <span className="font-bold text-primary">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Forma de Pagamento:</span>
                  <span>
                    {paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Previsão de Entrega:</span>
                  <span className="text-green-600 font-medium">
                    Até 2 horas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button size="lg" className="w-full" asChild>
              <Link to="/orders">Acompanhar Pedido</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/">Continuar Comprando</Link>
            </Button>
          </div>
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
              <Link to="/cart" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:block">Voltar ao Carrinho</span>
              </Link>
              <h1 className="text-xl font-bold">Finalizar Compra</h1>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Lock className="h-4 w-4 mr-1" />
              Compra Segura
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input id="street" placeholder="Rua das Flores, 123" />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" placeholder="Centro" />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" />
                  </div>
                  <div>
                    <Label htmlFor="zipcode">CEP</Label>
                    <Input id="zipcode" placeholder="01000-000" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="complement">Complemento (opcional)</Label>
                  <Input id="complement" placeholder="Apartamento 12B" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <Truck className="h-4 w-4" />
                  <span>
                    Entrega grátis na primeira compra • Previsão: até 2 horas
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="space-y-4">
                    {/* PIX */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label
                        htmlFor="pix"
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <Smartphone className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <div className="font-medium">PIX</div>
                          <div className="text-sm text-muted-foreground">
                            Aprovação imediata
                          </div>
                        </div>
                      </Label>
                      <Badge variant="secondary">Recomendado</Badge>
                    </div>

                    {/* Credit Card */}
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label
                        htmlFor="credit"
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <div className="font-medium">Cartão de Crédito</div>
                          <div className="text-sm text-muted-foreground">
                            Visa, Mastercard, Elo
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Credit Card Form */}
                {paymentMethod === "credit" && (
                  <div className="mt-6 space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Validade</Label>
                        <Input id="expiry" placeholder="MM/AA" maxLength={5} />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" maxLength={4} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input id="cardName" placeholder="JOÃO SILVA" />
                    </div>
                  </div>
                )}

                {/* PIX Instructions */}
                {paymentMethod === "pix" && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Smartphone className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-800 mb-1">
                          Como funciona o PIX:
                        </p>
                        <ul className="text-green-700 space-y-1">
                          <li>
                            • Clique em "Pagar Agora" para gerar o código PIX
                          </li>
                          <li>• Abra seu app bancário e escaneie o QR Code</li>
                          <li>• Confirme o pagamento no seu banco</li>
                          <li>
                            • Pronto! Seu pedido será confirmado
                            instantaneamente
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p className="line-clamp-2">{item.name}</p>
                      <p className="text-muted-foreground">{item.store}</p>
                      <p className="text-muted-foreground">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      R${" "}
                      {(item.price * item.quantity)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Desconto (PRIMEIRA10)</span>
                  <span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 mr-1 text-green-600" />
                    <span>Frete</span>
                  </div>
                  <span className="text-green-600 font-medium">GRÁTIS</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    `Pagar Agora - R$ ${total.toFixed(2).replace(".", ",")}`
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground">
                  Ao finalizar, você concorda com nossos{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
