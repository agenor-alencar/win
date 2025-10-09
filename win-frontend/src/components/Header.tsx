import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Menu,
  Heart,
  Tag,
  Package,
  Truck,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useSearch } from "../contexts/SearchContext";
import UserNavbar from "./UserNavbar";

interface HeaderProps {
  showCategories?: boolean;
}

const categories = [
  {
    name: "Ferragens",
    icon: "🔧",
    subcategories: ["Parafusos", "Porcas", "Arruelas", "Fechaduras"],
  },
  {
    name: "Elétricos",
    icon: "⚡",
    subcategories: ["Cabos", "Tomadas", "Interruptores", "Lâmpadas"],
  },
  {
    name: "Limpeza",
    icon: "🧽",
    subcategories: ["Detergentes", "Desinfetantes", "Produtos Gerais"],
  },
  {
    name: "Embalagens",
    icon: "📦",
    subcategories: ["Caixas", "Sacos", "Fitas", "Bubble Wrap"],
  },
  {
    name: "Autopeças",
    icon: "🚗",
    subcategories: ["Filtros", "Óleos", "Pneus", "Baterias"],
  },
];

export default function Header({ showCategories = true }: HeaderProps) {
  const { state } = useCart();
  const { searchQuery, setSearchQuery, searchProducts } = useSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-6 text-muted-foreground">
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                (61) 99533-4141
              </div>
              <div className="flex items-center">
                <Truck className="h-3 w-3 mr-1" />
                Frete grátis na primeira compra
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/sell"
                className="text-[#3DBEAB] hover:text-[#3DBEAB]/80 font-medium"
              >
                Venda no WIN
              </Link>
              <Link
                to="/help"
                className="text-muted-foreground hover:text-primary"
              >
                Central de Ajuda
              </Link>
              <Link
                to="/track"
                className="text-muted-foreground hover:text-primary"
              >
                Rastrear Pedido
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">WIN</h1>
              <span className="ml-2 text-sm text-muted-foreground hidden sm:block">
                Marketplace Local
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos, lojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Buscar
              </Button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Favorites - Desktop only */}
            <Link to="/favorites" className="hidden md:block">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <UserNavbar />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              Buscar
            </Button>
          </form>
        </div>
      </div>

      {/* Categories Navigation - Desktop */}
      {showCategories && (
        <div className="border-t hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 py-2">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group category-dropdown-container"
                >
                  <button className="flex items-center h-12 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                    <ChevronDown className="ml-1 h-4 w-4 chevron-rotate" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="category-dropdown-menu">
                    <div className="p-6">
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground mb-3">
                          {category.name}
                        </h3>
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub}
                            to={`/category/${category.name.toLowerCase()}?sub=${sub.toLowerCase()}`}
                            className="dropdown-menu-item block text-sm font-medium leading-none"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t mt-3 pt-3">
                        <Link
                          to={`/category/${category.name.toLowerCase()}`}
                          className="dropdown-menu-item block text-sm font-medium text-primary"
                        >
                          Ver todos em {category.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Links */}
              <Link
                to="/deals"
                className="flex items-center h-12 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md"
              >
                <Tag className="mr-2 h-4 w-4" />
                Promoções
              </Link>

              <Link
                to="/new-arrivals"
                className="flex items-center h-12 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md"
              >
                <Package className="mr-2 h-4 w-4" />
                Novidades
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <Link
                to="/favorites"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5 mr-3" />
                <span>Favoritos</span>
              </Link>
              <Link
                to="/deals"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Tag className="h-5 w-5 mr-3" />
                <span>Promoções</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="h-5 w-5 mr-3" />
                <span>Central de Ajuda</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
