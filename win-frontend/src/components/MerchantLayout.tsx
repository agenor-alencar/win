import React, { useState } from "react";
import { MerchantSidebar } from "./MerchantSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                    <p className="text-sm text-gray-500">Você tem 3 notificações não lidas</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Novo pedido #12345
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            há 5 minutos
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Produto aprovado
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            há 1 hora
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Estoque baixo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            há 2 horas
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
                  <p className="text-xs text-gray-500">Vendas Hoje</p>
                  <p className="text-sm font-semibold text-gray-900">R$ 2.450,00</p>
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
