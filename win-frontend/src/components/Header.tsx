import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../contexts/AuthContext";
import UserNavbar from "./UserNavbar";
import CEPWidget from "./CEPWidget";
import { categoryApi, type Category } from "@/lib/CategoryApi";
import { CategoryIcon } from "@/lib/categoryIcons";

interface HeaderProps {
  showCategories?: boolean;
}

export default function Header({ showCategories = true }: HeaderProps) {
  const { state } = useCart();
  const { searchQuery, setSearchQuery, searchProducts } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Buscar categorias da API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryApi.getCategoriesWithSubcategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Função para lidar com clique em "Venda no WIN"
  const handleVendaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Se usuário já tem perfil LOJISTA, vai direto para dashboard
    if (user?.perfis?.includes("LOJISTA")) {
      navigate("/merchant/dashboard");
    } else {
      // Caso contrário, vai para página de cadastro/informações
      navigate("/sell");
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
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Truck className="h-3 w-3 mr-1" />
                  Frete grátis na primeira compra
                </div>
                <CEPWidget />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleVendaClick}
                className="text-[#3DBEAB] hover:text-[#3DBEAB]/80 font-medium"
              >
                Venda no WIN
              </button>
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
            <Link to="/meus-favoritos" className="hidden md:block">
              <Button variant="ghost" size="icon" title="Meus Favoritos">
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
              {loadingCategories ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground px-4 py-2">
                  <Package className="h-4 w-4 animate-spin" />
                  <span>Carregando categorias...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-muted-foreground px-4 py-2">
                  Nenhuma categoria disponível
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="relative group category-dropdown-container"
                  >
                    <Link
                      to={`/category/${category.nome.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center h-12 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md"
                    >
                      <CategoryIcon 
                        iconName={category.icone} 
                        className="mr-2 h-4 w-4" 
                      />
                      {category.nome}
                      {category.subcategorias && category.subcategorias.length > 0 && (
                        <ChevronDown className="ml-1 h-4 w-4 chevron-rotate" />
                      )}
                    </Link>

                    {/* Dropdown Menu - Apenas se tiver subcategorias */}
                    {category.subcategorias && category.subcategorias.length > 0 && (
                      <div className="category-dropdown-menu">
                        <div className="p-6">
                          <div className="space-y-2">
                            <h3 className="font-medium text-sm text-muted-foreground mb-3">
                              {category.nome}
                            </h3>
                            {category.subcategorias.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/category/${sub.nome.toLowerCase().replace(/\s+/g, '-')}`}
                                className="dropdown-menu-item block text-sm font-medium leading-none"
                              >
                                {sub.nome}
                              </Link>
                            ))}
                          </div>
                          <div className="border-t mt-3 pt-3">
                            <Link
                              to={`/category/${category.nome.toLowerCase().replace(/\s+/g, '-')}`}
                              className="dropdown-menu-item block text-sm font-medium text-primary"
                            >
                              Ver todos em {category.nome}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

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
        <div className="md:hidden border-t bg-white max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {/* Ações Principais - Venda no WIN destacado */}
            <div className="bg-gradient-to-r from-[#3DBEAB]/10 to-[#2D9CDB]/10 rounded-lg p-3 border-2 border-[#3DBEAB]">
              <button
                onClick={(e) => {
                  handleVendaClick(e);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center p-3 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                <Package className="h-5 w-5 mr-2" />
                Venda no WIN
              </button>
            </div>

            {/* Categorias */}
            <div>
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2 px-2">Categorias</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.nome.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CategoryIcon iconName={category.icone} className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">{category.nome}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-4" />

            {/* Menu Principal */}
            <div className="space-y-2">
              <Link
                to="/meus-favoritos"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
                title="Meus Favoritos"
              >
                <Heart className="h-5 w-5 mr-3 text-red-500" />
                <span className="text-sm font-medium">Favoritos</span>
              </Link>
              <Link
                to="/deals"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Tag className="h-5 w-5 mr-3 text-orange-500" />
                <span className="text-sm font-medium">Promoções</span>
              </Link>
              <Link
                to="/track"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Truck className="h-5 w-5 mr-3 text-blue-500" />
                <span className="text-sm font-medium">Rastrear Pedido</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="h-5 w-5 mr-3 text-green-500" />
                <span className="text-sm font-medium">Central de Ajuda</span>
              </Link>
            </div>

            {/* Contato */}
            <div className="border-t pt-4">
              <a
                href="tel:+5561995334141"
                className="flex items-center justify-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">(61) 99533-4141</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
