import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Store,
  Package,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Plus,
  Eye,
  DollarSign,
} from "lucide-react";

const MerchantNavbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/merchant/dashboard",
      icon: BarChart3,
    },
    {
      name: "Vendas",
      path: "/merchant/orders",
      icon: ShoppingBag,
      badge: "3",
    },
    {
      name: "Anúncios",
      path: "/merchant/products",
      icon: Package,
    },
    {
      name: "Devoluções",
      path: "/merchant/returns",
      icon: RotateCcw,
      badge: "1",
    },
    {
      name: "Financeiro",
      path: "/merchant/financial",
      icon: DollarSign,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Loja */}
          <div className="flex items-center space-x-4">
            <Link
              to="/merchant/dashboard"
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">WIN</span>
                <span className="text-sm text-gray-500 block leading-none">
                  Lojista
                </span>
              </div>
            </Link>
          </div>

          {/* Menu Principal */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`relative ${
                      isActive(item.path)
                        ? "bg-[#3DBEAB] hover:bg-[#3DBEAB]/90 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {item.badge && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center space-x-3">
            {/* Botão Criar Anúncio */}
            <Link to="/merchant/products/new">
              <Button className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Anúncio
              </Button>
            </Link>

            {/* Notificações */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                2
              </Badge>
            </Button>

            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">Jc Ferragens</p>
                    <p className="text-xs text-gray-500">jcferragens@loja.com</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link to="/merchant/profile">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Perfil da Loja
                  </DropdownMenuItem>
                </Link>
                <Link to="/merchant/settings">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                </Link>
                <Link to="/merchant/profile">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Loja Pública
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 px-4 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`relative ${
                    isActive(item.path)
                      ? "bg-[#3DBEAB] hover:bg-[#3DBEAB]/90 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.name}
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MerchantNavbar;
