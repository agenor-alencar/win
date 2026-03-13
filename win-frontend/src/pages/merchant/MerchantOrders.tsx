import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, RefreshCw, Search } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { MerchantLayout } from "@/components/MerchantLayout";
import { api } from "@/lib/Api";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  numeroPedido: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
  status: string;
  total: number;
  itens: Array<{
    id: string;
    nomeProduto: string;
    quantidade: number;
    subtotal: number;
  }>;
  criadoEm: string;
}

interface Lojista {
  id: string;
  nomeFantasia: string;
}

type FilterTab = "all" | "prep" | "ready" | "transit";

export default function MerchantOrders() {
  const [selectedTab, setSelectedTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lojista, setLojista] = useState<Lojista | null>(null);

  const { success, error: notifyError } = useNotification();
  const { toast } = useToast();

  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const firstLoadRef = useRef(true);

  const playNewOrderSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.25,
        audioContext.currentTime + 0.02,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.22,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.22);
    } catch {
      // ignora falha de áudio sem quebrar o fluxo
    }
  };

  const getOrderStatus = (status: string) => status.toUpperCase();

  const fetchOrders = useCallback(async () => {
    try {
      if (firstLoadRef.current) {
        setLoading(true);
      }

      const { data: lojistaData } = await api.get<Lojista>("/v1/lojistas/me");
      setLojista(lojistaData);

      const { data: ordersData } = await api.get<Order[]>(
        `/v1/pedidos/lojista/${lojistaData.id}/pendentes-preparacao`,
      );

      const newIds = new Set(ordersData.map((order) => order.id));
      if (!firstLoadRef.current) {
        const hasNewOrder = ordersData.some(
          (order) => !knownOrderIdsRef.current.has(order.id),
        );

        if (hasNewOrder) {
          playNewOrderSound();
          toast({
            title: "Novo pedido recebido",
            description: "Há novos pedidos na fila do lojista.",
          });
        }
      }

      knownOrderIdsRef.current = newIds;
      setOrders(ordersData);
      setLoading(false);
      firstLoadRef.current = false;
    } catch (error: any) {
      console.error("Erro ao buscar pedidos:", error);
      toast({
        title: "Erro ao carregar pedidos",
        description:
          error.response?.data?.message || "Não foi possível carregar os pedidos",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 30000);
    return () => clearInterval(timer);
  }, [fetchOrders]);

  const startPreparingOrder = async (orderId: string) => {
    try {
      await api.patch(`/v1/pedidos/${orderId}/preparando`);
      success("Preparação iniciada!", "Pedido movido para PREPARANDO");
      await fetchOrders();
    } catch (error: any) {
      notifyError(
        "Erro",
        error.response?.data?.message ||
          "Não foi possível iniciar o preparo do pedido",
      );
    }
  };

  const markAsReady = async (orderId: string) => {
    try {
      await api.patch(`/v1/pedidos/${orderId}/pronto`);
      success("Pedido pronto!", "Pedido movido para PRONTO");
      await fetchOrders();
    } catch (error: any) {
      notifyError(
        "Erro",
        error.response?.data?.message || "Não foi possível marcar como pronto",
      );
    }
  };

  const getShortOrderId = (numeroPedido: string) => {
    const digits = (numeroPedido || "").replace(/\D/g, "");
    if (digits.length >= 5) {
      return `#${digits.slice(-5)}`;
    }
    return `#${(numeroPedido || "").slice(-5)}`;
  };

  const formatRelativeTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Agora mesmo";
    if (diffMin < 60) return `Há ${diffMin} minuto${diffMin > 1 ? "s" : ""}`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24)
      return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;

    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  };

  const summarizeItems = (items: Order["itens"]) => {
    if (!items || items.length === 0) return "Sem itens";

    const base = items
      .slice(0, 2)
      .map((item) => `${item.quantidade}x ${item.nomeProduto}`)
      .join(", ");

    if (items.length > 2) {
      return `${base} +${items.length - 2} item(ns)`;
    }

    return base;
  };

  const statusLabel = (status: string) => {
    const normalized = getOrderStatus(status);
    if (normalized === "EM_TRANSITO") return "Em Entrega";
    if (normalized === "PREPARANDO") return "Em Preparo";
    if (normalized === "CONFIRMADO") return "Confirmado";
    if (normalized === "PRONTO") return "Aguardando Motorista";
    return normalized;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order.status);

      const matchesTab =
        selectedTab === "all" ||
        (selectedTab === "prep" && ["CONFIRMADO", "PREPARANDO"].includes(status)) ||
        (selectedTab === "ready" && status === "PRONTO") ||
        (selectedTab === "transit" && status === "EM_TRANSITO");

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        order.numeroPedido.toLowerCase().includes(q) ||
        getShortOrderId(order.numeroPedido).toLowerCase().includes(q) ||
        (order.usuario?.nome || "").toLowerCase().includes(q) ||
        summarizeItems(order.itens).toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [orders, searchQuery, selectedTab]);

  const prepCount = orders.filter((order) =>
    ["CONFIRMADO", "PREPARANDO"].includes(getOrderStatus(order.status)),
  ).length;
  const readyCount = orders.filter(
    (order) => getOrderStatus(order.status) === "PRONTO",
  ).length;
  const transitCount = orders.filter(
    (order) => getOrderStatus(order.status) === "EM_TRANSITO",
  ).length;

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-[#3DBEAB]" />
          <span className="ml-3 text-lg">Carregando pedidos...</span>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-[#3DBEAB]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
              <p className="text-sm text-gray-600">
                Fila operacional da loja {lojista?.nomeFantasia ? `• ${lojista.nomeFantasia}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" className="rounded-xl" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link to="/merchant/dashboard">
              <Button variant="outline" className="rounded-xl">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por #pedido, cliente ou produto..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as FilterTab)}>
          <TabsList className="grid w-full grid-cols-4 bg-[#F8F9FA] rounded-xl">
            <TabsTrigger value="all" className="data-[state=active]:bg-white rounded-xl">
              Todos ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="prep" className="data-[state=active]:bg-white rounded-xl">
              Em Preparo ({prepCount})
            </TabsTrigger>
            <TabsTrigger value="ready" className="data-[state=active]:bg-white rounded-xl">
              Prontos ({readyCount})
            </TabsTrigger>
            <TabsTrigger value="transit" className="data-[state=active]:bg-white rounded-xl">
              Em Trânsito ({transitCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const status = getOrderStatus(order.status);

            return (
              <Card key={order.id} className="rounded-xl border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {getShortOrderId(order.numeroPedido)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(order.criadoEm)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 truncate max-w-[760px]">
                        {summarizeItems(order.itens)}
                      </p>

                      <p className="text-lg font-bold text-[#3DBEAB]">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap md:justify-end">
                      {status === "CONFIRMADO" && (
                        <Button className="rounded-xl" onClick={() => startPreparingOrder(order.id)}>
                          Iniciar Preparo
                        </Button>
                      )}

                      {status === "PREPARANDO" && (
                        <Button className="rounded-xl" onClick={() => markAsReady(order.id)}>
                          Marcar como Pronto
                        </Button>
                      )}

                      {status === "PRONTO" && (
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                          Aguardando Motorista
                        </Badge>
                      )}

                      {status === "EM_TRANSITO" && (
                        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                          Em Entrega
                        </Badge>
                      )}

                      {!(["CONFIRMADO", "PREPARANDO", "PRONTO", "EM_TRANSITO"].includes(status)) && (
                        <Badge variant="secondary">{statusLabel(status)}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">Não há pedidos para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
