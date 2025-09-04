import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNotification } from "../../contexts/NotificationContext";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Copy,
  Star,
  User,
  Home,
  Grid3X3,
  ShoppingCart,
} from "lucide-react";

const orders = [
  {
    id: "WIN2024001",
    date: "2024-01-15",
    status: "delivered",
    total: 70.9,
    items: [
      {
        name: "Parafuso Phillips 3x20mm - 100 unidades",
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
    deliveryCode: "1234",
    tracking: [
      {
        status: "confirmed",
        title: "Pedido Confirmado",
        description: "Seu pedido foi confirmado e está sendo preparado",
        time: "14:30",
        completed: true,
      },
      {
        status: "preparing",
        title: "Em Preparação",
        description: "Os itens estão sendo separados pelas lojas",
        time: "14:45",
        completed: true,
      },
      {
        status: "transit",
        title: "Saiu para Entrega",
        description: "Seu pedido está a caminho",
        time: "15:20",
        completed: true,
      },
      {
        status: "delivered",
        title: "Entregue",
        description: "Pedido entregue com sucesso",
        time: "16:10",
        completed: true,
      },
    ],
  },
  {
    id: "WIN2024002",
    date: "2024-01-16",
    status: "transit",
    total: 156.4,
    items: [
      {
        name: "Furadeira de Impacto 650W",
        quantity: 1,
        price: 189.9,
        store: "Ferramentas Pro",
      },
    ],
    deliveryCode: "5678",
    estimatedTime: "30 min",
    tracking: [
      {
        status: "confirmed",
        title: "Pedido Confirmado",
        description: "Seu pedido foi confirmado e está sendo preparado",
        time: "09:15",
        completed: true,
      },
      {
        status: "preparing",
        title: "Em Preparação",
        description: "Os itens estão sendo separados pelas lojas",
        time: "09:30",
        completed: true,
      },
      {
        status: "transit",
        title: "Saiu para Entrega",
        description: "João está levando seu pedido até você",
        time: "10:45",
        completed: true,
      },
      {
        status: "delivered",
        title: "Entregar",
        description: "Aguardando entrega",
        time: "~11:15",
        completed: false,
      },
    ],
  },
  {
    id: "WIN2024003",
    date: "2024-01-16",
    status: "preparing",
    total: 89.3,
    items: [
      {
        name: "Detergente Concentrado 1L",
        quantity: 3,
        price: 8.9,
        store: "Casa Limpa",
      },
      {
        name: "Caixa de Papelão 30x30x20",
        quantity: 20,
        price: 3.2,
        store: "Embalagens Pro",
      },
    ],
    deliveryCode: "9012",
    estimatedTime: "45 min",
    tracking: [
      {
        status: "confirmed",
        title: "Pedido Confirmado",
        description: "Seu pedido foi confirmado e está sendo preparado",
        time: "11:20",
        completed: true,
      },
      {
        status: "preparing",
        title: "Em Preparação",
        description: "Os itens estão sendo separados pelas lojas",
        time: "11:25",
        completed: true,
      },
      {
        status: "transit",
        title: "Saiu para Entrega",
        description: "Aguardando saída para entrega",
        time: "~12:10",
        completed: false,
      },
      {
        status: "delivered",
        title: "Entregar",
        description: "Aguardando entrega",
        time: "~12:45",
        completed: false,
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "preparing":
      return "bg-yellow-100 text-yellow-800";
    case "transit":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "preparing":
      return "Em Preparação";
    case "transit":
      return "Em Trânsito";
    case "delivered":
      return "Entregue";
    default:
      return "Aguardando";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "preparing":
      return Clock;
    case "transit":
      return Truck;
    case "delivered":
      return CheckCircle;
    default:
      return Package;
  }
};

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { success, error } = useNotification();

  const activeOrders = orders.filter((order) => order.status !== "delivered");
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered",
  );

  const copyDeliveryCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRateOrder = (order: any) => {
    setSelectedOrderForRating(order);
    setRatingDialogOpen(true);
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      error(
        "Avaliação obrigatória",
        "Por favor, selecione uma nota de 1 a 5 estrelas.",
      );
      return;
    }

    // Simulate API call
    setTimeout(() => {
      success(
        "Avaliação enviada!",
        `Obrigado por avaliar seu pedido ${selectedOrderForRating?.id}`,
      );
      setRatingDialogOpen(false);
      setSelectedOrderForRating(null);
      setRating(0);
      setReviewText("");
    }, 1000);
  };

  const renderStars = (
    currentRating: number,
    onStarClick?: (rating: number) => void,
  ) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starRating = index + 1;
      return (
        <button
          key={index}
          type="button"
          onClick={() => onStarClick && onStarClick(starRating)}
          className={`text-2xl ${
            starRating <= currentRating ? "text-yellow-400" : "text-gray-300"
          } ${onStarClick ? "hover:text-yellow-400 cursor-pointer" : ""}`}
          disabled={!onStarClick}
        >
          ★
        </button>
      );
    });
  };

  const OrderCard = ({ order }: { order: (typeof orders)[0] }) => {
    const StatusIcon = getStatusIcon(order.status);
    const isActive = order.status !== "delivered";

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-sm">#{order.id}</span>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(order.date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">
                R$ {order.total.toFixed(2).replace(".", ",")}
              </p>
              {isActive && order.estimatedTime && (
                <p className="text-sm text-green-600">
                  Entrega em {order.estimatedTime}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="text-sm">
                <p className="line-clamp-1">
                  {item.quantity}x {item.name}
                </p>
                <p className="text-muted-foreground">{item.store}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className="h-4 w-4" />
              <span className="text-sm">
                {order.tracking.find((t) => t.completed)?.description ||
                  "Processando..."}
              </span>
            </div>

            {isActive && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedOrder(
                      selectedOrder === order.id ? null : order.id,
                    )
                  }
                >
                  {selectedOrder === order.id ? "Ocultar" : "Ver Detalhes"}
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/order/${order.id}`}>Acompanhar</Link>
                </Button>
              </div>
            )}

            {order.status === "delivered" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRateOrder(order)}
              >
                <Star className="h-3 w-3 mr-1" />
                Avaliar
              </Button>
            )}
          </div>

          {/* Delivery Code for Active Orders */}
          {isActive && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Código de Recebimento</p>
                  <p className="text-xs text-muted-foreground">
                    Informe este código ao entregador
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-bold text-primary">
                    {order.deliveryCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyDeliveryCode(order.deliveryCode)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {copiedCode === order.deliveryCode && (
                <p className="text-xs text-green-600 mt-1">Código copiado!</p>
              )}
            </div>
          )}

          {/* Tracking Details */}
          {selectedOrder === order.id && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <h4 className="font-medium">Acompanhar Entrega</h4>
              <div className="space-y-3">
                {order.tracking.map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {index < order.tracking.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            step.completed ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{step.title}</h5>
                        <span className="text-xs text-muted-foreground">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {order.status === "transit" && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    O entregador está próximo da sua localização
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center mr-4 md:hidden">
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Link>
              <h1 className="text-xl font-bold">Meus Pedidos</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">
              Em Andamento ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Entregues ({deliveredOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum pedido em andamento
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Que tal fazer seu primeiro pedido?
                  </p>
                  <Button asChild>
                    <Link to="/">Começar a Comprar</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {deliveredOrders.length > 0 ? (
              deliveredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum pedido entregue ainda
                  </h3>
                  <p className="text-muted-foreground">
                    Seus pedidos entregues aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rating Modal */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrderForRating && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">
                  Pedido #{selectedOrderForRating.id}
                </h4>
                <p className="text-xs text-gray-500">
                  {selectedOrderForRating.items.length}{" "}
                  {selectedOrderForRating.items.length === 1 ? "item" : "itens"}{" "}
                  • Total: R$ {selectedOrderForRating.total.toFixed(2)}
                </p>
                <div className="mt-2">
                  {selectedOrderForRating.items.map(
                    (item: any, index: number) => (
                      <p key={index} className="text-xs text-gray-600">
                        • {item.name} ({item.store})
                      </p>
                    ),
                  )}
                </div>
              </div>

              {/* Rating Stars */}
              <div className="text-center">
                <Label className="text-sm font-medium">
                  Como foi sua experiência geral?
                </Label>
                <div className="flex justify-center space-x-1 mt-2">
                  {renderStars(rating, setRating)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 0 && "Clique nas estrelas para avaliar"}
                  {rating === 1 && "Péssimo"}
                  {rating === 2 && "Ruim"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bom"}
                  {rating === 5 && "Excelente"}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <Label htmlFor="review-text">
                  Conte como foi sua experiência (opcional)
                </Label>
                <Textarea
                  id="review-text"
                  placeholder="Como foi a qualidade dos produtos? E a entrega? Suas observações ajudam outros compradores..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Review Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Avalie:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• A qualidade dos produtos</li>
                  <li>• O tempo de entrega</li>
                  <li>• O atendimento das lojas</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRatingDialogOpen(false);
                    setSelectedOrderForRating(null);
                    setRating(0);
                    setReviewText("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmitRating} className="flex-1">
                  Enviar Avaliação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              3
            </Badge>
          </Link>
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center text-primary"
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
