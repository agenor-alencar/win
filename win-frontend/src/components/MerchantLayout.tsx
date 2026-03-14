import React, { useEffect, useState } from "react";
import { MerchantSidebar } from "./MerchantSidebar";
import { Bell, Search } from "lucide-react";
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
}

interface LayoutStats {
  receitaHoje: number;
  totalPedidosPendentes: number;
}

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState<LayoutStats | null>(null);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const { data: lojista } = await api.get<LayoutLojista>("/v1/lojistas/me");
        const { data } = await api.get<LayoutStats>(`/v1/lojistas/${lojista.id}/estatisticas`);
        setStats(data);
      } catch (error) {
        console.warn("Não foi possível carregar resumo do cabeçalho do lojista", error);
      }
    };

    carregarResumo();
  }, []);

  const receitaHojeFormatada = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(stats?.receitaHoje || 0);

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
                      {stats?.totalPedidosPendentes || 0}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                    <p className="text-sm text-gray-500">
                      {stats?.totalPedidosPendentes || 0} pedido(s) pago(s) aguardando ação
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Pedidos pendentes pagos
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stats?.totalPedidosPendentes || 0} aguardando atendimento
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-4 py-2">
                    <Button variant="ghost" className="w-full text-sm">
                      Ver todas notificações
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
