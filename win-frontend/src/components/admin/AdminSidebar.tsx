import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  FolderIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Usuários", href: "/admin/users", icon: UsersIcon },
  { name: "Lojas", href: "/admin/stores", icon: BuildingStorefrontIcon },
  { name: "Motoristas", href: "/admin/drivers", icon: TruckIcon },
  { name: "Categorias", href: "/admin/categories", icon: FolderIcon },
  { name: "Produtos", href: "/admin/products", icon: ShoppingBagIcon },
  { name: "Pedidos", href: "/admin/orders", icon: ClipboardDocumentListIcon },
  { name: "Entregas", href: "/admin/deliveries", icon: MapPinIcon },
  { name: "Finanças", href: "/admin/finances", icon: BanknotesIcon },
  { name: "Configurações", href: "/admin/settings", icon: Cog6ToothIcon },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const location = useLocation();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
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
                WIN Admin
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white"
                    : "text-[#111827] hover:bg-gray-100"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0`}
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            className={`group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <ArrowRightOnRectangleIcon
              className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0`}
            />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
