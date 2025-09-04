import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  MapPin,
  Copy,
  Star,
  Download,
  Share2,
  Home,
  Package,
} from "lucide-react";

// Simulated order data - in real app this would come from API
const orderData = {
  id: "WIN2024001",
  date: new Date().toISOString(),
  total: 70.9,
  discount: 7.09,
  subtotal: 78.0,
  items: [
    {
      name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
      quantity: 2,
      price: 12.5,
      store: "Ferragens Silva",
    },
    {
      name: "Cabo Flexível 2,5mm",
      quantity: 1,
      price: 45.9,
      store: "Elétrica Central",
    },
  ],
  customer: {
    name: "João Silva",
    address: "Rua das Flores, 123 - Centro, São Paulo",
  },
  payment: {
    method: "PIX",
    status: "approved",
  },
  delivery: {
    code: "1234",
    estimatedTime: "até 2 horas",
    status: "preparing",
  },
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyDeliveryCode = () => {
    navigator.clipboard.writeText(orderData.delivery.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Pedido WIN #${orderData.id}`,
        text: `Meu pedido foi confirmado! Código de entrega: ${orderData.delivery.code}`,
        url: window.location.href,
      });
    } else {
      copyDeliveryCode();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">WIN</h1>
              <span className="ml-2 text-sm text-muted-foreground">
                Pedido Confirmado
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={shareOrder}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Pagamento aprovado e pedido enviado para as lojas
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <Badge
              variant="outline"
              className="text-green-700 border-green-200"
            >
              <Clock className="h-3 w-3 mr-1" />
              Confirmado há {formatTime(timeElapsed)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      Pedido #{orderData.id}
                    </h2>
                    <p className="text-muted-foreground">
                      {new Date(orderData.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Itens do Pedido</h3>
                  {orderData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.store} • Qtd: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          R${" "}
                          {(item.price * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      R$ {orderData.subtotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>
                      -R$ {orderData.discount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Frete</span>
                    <span>GRÁTIS</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {orderData.total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-medium">{orderData.customer.name}</p>
                  <p className="text-muted-foreground">
                    {orderData.customer.address}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Informações de Pagamento</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{orderData.payment.method}</p>
                    <p className="text-sm text-muted-foreground">
                      Pagamento processado com sucesso
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {orderData.payment.status === "approved"
                      ? "Aprovado"
                      : "Pendente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Code */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">
                  Código de Recebimento
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Informe este código ao entregador
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="text-3xl font-mono font-bold text-primary">
                    {orderData.delivery.code}
                  </div>
                </div>
                <Button
                  onClick={copyDeliveryCode}
                  variant={copiedCode ? "secondary" : "default"}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedCode ? "Código Copiado!" : "Copiar Código"}
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Status */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Status da Entrega</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pedido Confirmado</p>
                      <p className="text-sm text-muted-foreground">
                        Agora mesmo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Em Preparação</p>
                      <p className="text-sm text-muted-foreground">
                        Previsão: 5-15 min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Saiu para Entrega</p>
                      <p className="text-sm text-muted-foreground">
                        Previsão: {orderData.delivery.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to={`/orders`}>
                  <Package className="h-4 w-4 mr-2" />
                  Acompanhar Pedido
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Continuar Comprando
                </Link>
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Star className="h-4 w-4 mr-2" />
                Avaliar Lojas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
