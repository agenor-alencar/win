import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  RotateCcw,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Star,
  Store,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MerchantSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navigation = [
  { 
    name: "Dashboard", 
    href: "/merchant/dashboard", 
    icon: LayoutDashboard,
    description: "Visão geral"
  },
  { 
    name: "Produtos", 
    href: "/merchant/products", 
    icon: Package,
    description: "Gerenciar produtos"
  },
  { 
    name: "Pedidos", 
    href: "/merchant/orders", 
    icon: ShoppingCart,
    description: "Gerenciar pedidos"
  },
  { 
    name: "Financeiro", 
    href: "/merchant/financial", 
    icon: DollarSign,
    description: "Vendas e receita"
  },
  { 
    name: "Devoluções", 
    href: "/merchant/returns", 
    icon: RotateCcw,
    description: "Gerenciar devoluções"
  },
  { 
    name: "Avaliações", 
    href: "/merchant/reviews", 
    icon: Star,
    description: "Avaliações dos clientes"
  },
  { 
    name: "Relatórios", 
    href: "/merchant/reports", 
    icon: BarChart3,
    description: "Relatórios e analytics"
  },
];

const secondaryNavigation = [
  { 
    name: "Modo Cliente", 
    href: "/", 
    icon: Store,
    description: "Voltar para loja",
    highlight: true // Flag para destacar este item
  },
  { 
    name: "Perfil", 
    href: "/merchant/profile", 
    icon: User,
    description: "Meu perfil"
  },
  { 
    name: "Configurações", 
    href: "/merchant/settings", 
    icon: Settings,
    description: "Configurações da loja"
  },
];

export const MerchantSidebar: React.FC<MerchantSidebarProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="ml-2 text-[#111827] font-semibold">
                WIN Lojista
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User Info (quando não colapsado) */}
        {!collapsed && user && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#3DBEAB]/5 to-[#2D9CDB]/5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.nome?.charAt(0).toUpperCase() || "L"}
                </span>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.nome || "Lojista"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email || ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white shadow-sm"
                      : "text-[#111827] hover:bg-gray-100"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex-1">
                      <span className="block">{item.name}</span>
                      {!isActive && (
                        <span className="text-xs text-gray-500 group-hover:text-gray-600">
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              const isHighlight = item.highlight;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isHighlight
                      ? "bg-[#3DBEAB]/10 text-[#3DBEAB] hover:bg-[#3DBEAB]/20 border border-[#3DBEAB]/30"
                      : isActive
                      ? "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white shadow-sm"
                      : "text-[#111827] hover:bg-gray-100"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0 ${
                      isHighlight
                        ? "text-[#3DBEAB]"
                        : isActive 
                        ? "text-white" 
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex-1">
                      <span className={`block ${isHighlight ? "font-semibold" : ""}`}>
                        {item.name}
                      </span>
                      {!isActive && item.description && (
                        <span className={`text-xs ${
                          isHighlight 
                            ? "text-[#3DBEAB]/70" 
                            : "text-gray-500 group-hover:text-gray-600"
                        }`}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-gray-200 pt-4">
          <button
            onClick={handleLogout}
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut
              className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0`}
            />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
