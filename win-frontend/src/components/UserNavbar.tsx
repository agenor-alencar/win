import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Package,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  Star,
  CreditCard,
  MapPin,
  Bell,
  Store,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function UserNavbar() {
  const { user, isAuthenticated, logout } = useAuth();

  // If not authenticated, show login button
  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </Link>
    );
  }

  // If authenticated, show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Main Navigation */}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Meus Pedidos</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/favorites" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Favoritos</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/reviews" className="cursor-pointer">
            <Star className="mr-2 h-4 w-4" />
            <span>Minhas Avaliações</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/returns" className="cursor-pointer">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Devoluções</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Account Settings */}
        <DropdownMenuItem asChild>
          <Link to="/addresses" className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            <span>Endereços</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/payment-methods" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Formas de Pagamento</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/notifications" className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notificações</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Business Options (if merchant) */}
        {user?.type === "merchant" && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/merchant/dashboard" className="cursor-pointer">
                <Store className="mr-2 h-4 w-4" />
                <span>Painel da Loja</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Support & Settings */}
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/help" className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Central de Ajuda</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
