import React, { useEffect, useMemo, useState } from "react";
import { MerchantSidebar } from "./MerchantSidebar";
import { AlertTriangle, Bell, CheckCheck, Info, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { api } from "@/lib/Api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MerchantLayoutProps {
  children: React.ReactNode;
}

interface LayoutLojista {
  id: string;
  usuarioId: string;
}

interface LayoutStats {
  receitaHoje: number;
  totalPedidosPendentes: number;
}

interface LayoutProduct {
  id: string;
  estoque: number;
  ativo: boolean;
}

interface LayoutNotification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  criadoEm: string;
}

interface DisplayNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  colorClass: string;
  isPersistent?: boolean;
}

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<LayoutStats | null>(null);
  const [lojista, setLojista] = useState<LayoutLojista | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [notifications, setNotifications] = useState<LayoutNotification[]>([]);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const { data: lojista } = await api.get<LayoutLojista>("/v1/lojistas/me");
        setLojista(lojista);

        const [statsRes, productsRes, notificationsRes] = await Promise.all([
          api.get<LayoutStats>(`/v1/lojistas/${lojista.id}/estatisticas`),
          api.get<LayoutProduct[]>(`/v1/produtos/lojista/${lojista.id}`),
          api.get<LayoutNotification[]>(`/v1/notificacao/list/nao-lidas/usuario/${lojista.usuarioId}`),
        ]);

        setStats(statsRes.data);
        setLowStockCount(productsRes.data.filter((product) => product.ativo && product.estoque < 10).length);
        setNotifications(notificationsRes.data);
      } catch (error) {
        console.warn("Não foi possível carregar resumo do cabeçalho do lojista", error);
      }
    };

    carregarResumo();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) return "agora";
    if (diffMinutes < 60) return `há ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays} dia(s)`;
  };

  const displayNotifications = useMemo<DisplayNotification[]>(() => {
    const baseNotifications = notifications.map((notification) => ({
      id: notification.id,
      title: notification.titulo,
      message: notification.mensagem,
      time: formatRelativeTime(notification.criadoEm),
      colorClass:
        notification.tipo === "ERRO"
          ? "bg-red-500"
          : notification.tipo === "AVISO"
          ? "bg-yellow-500"
          : notification.tipo === "SUCESSO"
          ? "bg-green-500"
          : "bg-blue-500",
      isPersistent: true,
    }));

    const operationalNotifications: DisplayNotification[] = [];

    if ((stats?.totalPedidosPendentes || 0) > 0) {
      operationalNotifications.push({
        id: "operational-pending-orders",
        title: "Pedidos pagos pendentes",
        message: `${stats?.totalPedidosPendentes || 0} aguardando atendimento`,
        time: "agora",
        colorClass: "bg-blue-500",
      });
    }

    if (lowStockCount > 0) {
      operationalNotifications.push({
        id: "operational-low-stock",
        title: "Estoque baixo",
        message: `${lowStockCount} produto(s) com estoque crítico`,
        time: "agora",
        colorClass: "bg-yellow-500",
      });
    }

    return [...operationalNotifications, ...baseNotifications].slice(0, 6);
  }, [lowStockCount, notifications, stats?.totalPedidosPendentes]);

  const handleMarkAllAsRead = async () => {
    if (!lojista?.usuarioId || notifications.length === 0) {
      return;
    }

    try {
      await api.patch(`/v1/notificacao/todas-lidas/usuario/${lojista.usuarioId}`);
      setNotifications([]);
    } catch (error) {
      console.warn("Não foi possível marcar notificações como lidas", error);
    }
  };

  const receitaHojeFormatada = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(stats?.receitaHoje || 0);

  const notificationCount = displayNotifications.length;

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <MerchantSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar produtos, pedidos..."
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {notificationCount}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
                    <div>
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                    <p className="text-sm text-gray-500">
                        {notificationCount} item(ns) relevante(s) no momento
                    </p>
                  </div>
                    {notifications.length > 0 && (
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleMarkAllAsRead}>
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Lidas
                      </Button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {displayNotifications.length > 0 ? (
                      displayNotifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer items-start">
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${notification.colorClass}`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                        <Info className="h-4 w-4 text-gray-400" />
                        Nenhuma notificação no momento
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-4 py-2">
                    <Button variant="ghost" className="w-full text-sm" disabled>
                      Central de notificações em breve
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Receita Hoje</p>
                  <p className="text-sm font-semibold text-gray-900">{receitaHojeFormatada}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
