import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Truck, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ordersApi } from "@/lib/api/ordersApi";
import { returnsApi, MotivoDevolucao } from "@/lib/api/returnsApi";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  processing: {
    label: "Processando",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  shipped: {
    label: "Em Transporte",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  delivered: {
    label: "Entregue",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function UserOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<MotivoDevolucao | "">("");
  const [returnDetails, setReturnDetails] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await ordersApi.getMyOrders(user.id);
      
      // Mapeamento de status PT-BR para EN
      const statusMap: Record<string, Order["status"]> = {
        PENDENTE: "pending",
        PROCESSANDO: "processing",
        ENVIADO: "shipped",
        ENTREGUE: "delivered",
        CANCELADO: "cancelled",
      };
      
      // Mapear dados da API para o formato esperado pelo componente
      const mappedOrders = data.map(order => ({
        id: order.id,
        orderNumber: order.numeroPedido,
        date: order.criadoEm,
        status: statusMap[order.status] || "pending",
        total: order.total,
        items: order.itens.map(item => ({
          id: item.id,
          name: item.produtoNome,
          image: item.produtoImagem || "/placeholder.svg",
          quantity: item.quantidade,
          price: item.precoUnitario,
        })),
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (status: string) => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  };

  const renderOrderCard = (order: Order) => {
    const statusInfo = statusConfig[order.status];
    const StatusIcon = statusInfo.icon;
    const canRequestReturn = order.status === "delivered";

    return (
      <Card key={order.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Pedido #{order.orderNumber}</CardTitle>
              <CardDescription>
                Realizado em {new Date(order.date).toLocaleDateString("pt-BR")}
              </CardDescription>
            </div>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total do pedido</p>
                <p className="text-xl font-bold text-gray-900">
                  R$ {order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${order.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Link>
                </Button>
                {canRequestReturn && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setSelectedItemId(order.items[0]?.id ?? "");
                      setSelectedReason("");
                      setReturnDetails("");
                      setIsReturnDialogOpen(true);
                    }}
                  >
                    Solicitar Devolução
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const motivoOptions: Array<{ label: string; value: MotivoDevolucao }> = [
    { label: "Produto com defeito", value: "PRODUTO_DEFEITUOSO" },
    { label: "Comprei a medida/modelo errado", value: "ERRO_MEDIDA_CLIENTE" },
    { label: "Produto diferente do anunciado", value: "PRODUTO_DIFERENTE" },
    { label: "Produto danificado no transporte", value: "PRODUTO_DANIFICADO" },
    { label: "Outro", value: "OUTRO" },
  ];

  const handleSubmitReturn = async () => {
    if (!selectedOrder || !selectedReason || !selectedItemId) {
      return;
    }

    const selectedItem = selectedOrder.items.find((item) => item.id === selectedItemId);
    if (!selectedItem) {
      return;
    }

    setIsSubmittingReturn(true);

    try {
      const quantidadeDevolvida = selectedItem.quantity;
      const valorDevolucao = Number((selectedItem.price * selectedItem.quantity).toFixed(2));
      const motivoLabel = motivoOptions.find((m) => m.value === selectedReason)?.label ?? "Outro";
      const descricaoBase = returnDetails.trim() || "Sem detalhes adicionais.";
      const descricao = `Solicitacao de devolucao: ${motivoLabel}. ${descricaoBase}`;

      const response = await returnsApi.createReturn({
        pedidoId: selectedOrder.id,
        itemPedidoId: selectedItem.id,
        motivoDevolucao: selectedReason,
        descricao,
        quantidadeDevolvida,
        valorDevolucao,
      });

      if (response.status === "APROVADO_SEM_COLETA") {
        toast({
          description:
            "Estorno aprovado! ✅ Para sua comodidade e eficiência logística, não é necessário devolver este produto. Guarde-o com você para uso futuro ou repasse. Considere um presente da loja para você!",
        });
      }

      if (response.status === "AGUARDANDO_ENTREGA_BALCAO") {
        toast({
          description:
            "Solicitação recebida! 📦 Para liberar o seu estorno, por favor, entregue o item no balcão da loja parceira.",
        });
      }

      setIsReturnDialogOpen(false);
      setSelectedOrder(null);
      setSelectedItemId("");
      setSelectedReason("");
      setReturnDetails("");
    } catch (error) {
      console.error("Erro ao solicitar devolução:", error);
      toast({
        title: "Erro ao solicitar devolução",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
            <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="processing">Processando</TabsTrigger>
              <TabsTrigger value="shipped">Em Transporte</TabsTrigger>
              <TabsTrigger value="delivered">Entregues</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Carregando pedidos...</p>
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum pedido encontrado
                    </p>
                    <p className="text-gray-500 mb-6">
                      Você ainda não realizou nenhuma compra
                    </p>
                    <Button asChild>
                      <Link to="/">Começar a Comprar</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filterOrders("all").map(renderOrderCard)
              )}
            </TabsContent>

            {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
              <TabsContent key={status} value={status}>
                {filterOrders(status).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        Nenhum pedido {statusConfig[status as keyof typeof statusConfig].label.toLowerCase()}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filterOrders(status).map(renderOrderCard)
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Solicitar devolução</DialogTitle>
            <DialogDescription>
              Selecione o motivo da devolução para o pedido {selectedOrder?.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-gray-600">Resumo do pedido</p>
              <p className="text-base font-semibold text-gray-900">
                #{selectedOrder?.orderNumber}
              </p>
              <p className="text-sm text-gray-500">
                Total: R$ {selectedOrder?.total.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Item do pedido</label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedOrder?.items ?? []).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Qtd: {item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Motivo</label>
              <Select value={selectedReason} onValueChange={(value) => setSelectedReason(value as MotivoDevolucao)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivoOptions.map((motivo) => (
                    <SelectItem key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descricao / Detalhes do problema (opcional)
              </label>
              <Textarea
                placeholder="Descreva o problema se desejar"
                value={returnDetails}
                onChange={(event) => setReturnDetails(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setIsReturnDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={!selectedReason || !selectedItemId || isSubmittingReturn}
            >
              {isSubmittingReturn ? "Enviando..." : "Confirmar devolução"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
