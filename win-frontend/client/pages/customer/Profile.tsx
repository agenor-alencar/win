import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Camera,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  Star,
  Package,
  Home,
  Grid3X3,
  ShoppingCart,
  Heart,
  Shield,
  FileText,
} from "lucide-react";

const userInfo = {
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "(11) 99999-9999",
  document: "123.456.789-00",
  address: {
    street: "Rua das Flores, 123",
    neighborhood: "Centro",
    city: "São Paulo",
    zipcode: "01000-000",
  },
  avatar: "/placeholder.svg",
  stats: {
    orders: 12,
    reviews: 8,
    favorites: 25,
  },
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(userInfo);

  const handleSave = () => {
    // TODO: Save updated info
    setIsEditing(false);
    console.log("Updated info:", editedInfo);
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setIsEditing(false);
  };

  const MenuSection = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{
      icon: React.ElementType;
      label: string;
      href?: string;
      onClick?: () => void;
      color?: string;
    }>;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer ${
                item.color || ""
              }`}
              onClick={item.onClick}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          );

          return item.href ? (
            <Link key={index} to={item.href}>
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center mr-4 md:hidden">
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Link>
              <h1 className="text-xl font-bold">Minha Conta</h1>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Informações Pessoais
                  {isEditing && (
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        Salvar
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                      <AvatarFallback>
                        {userInfo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{userInfo.name}</h3>
                    <p className="text-muted-foreground">Membro desde 2024</p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={editedInfo.name}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, name: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="document">CPF</Label>
                    <Input
                      id="document"
                      value={editedInfo.document}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedInfo.email}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, email: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editedInfo.phone}
                      onChange={(e) =>
                        setEditedInfo({ ...editedInfo, phone: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={editedInfo.address.street}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          address: {
                            ...editedInfo.address,
                            street: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={editedInfo.address.neighborhood}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          address: {
                            ...editedInfo.address,
                            neighborhood: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={editedInfo.address.city}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          address: {
                            ...editedInfo.address,
                            city: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipcode">CEP</Label>
                    <Input
                      id="zipcode"
                      value={editedInfo.address.zipcode}
                      onChange={(e) =>
                        setEditedInfo({
                          ...editedInfo,
                          address: {
                            ...editedInfo.address,
                            zipcode: e.target.value,
                          },
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {userInfo.stats.orders}
                    </div>
                    <div className="text-sm text-muted-foreground">Pedidos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {userInfo.stats.reviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avaliações
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {userInfo.stats.favorites}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Favoritos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Sections */}
            <MenuSection
              title="Minha Conta"
              items={[
                {
                  icon: Package,
                  label: "Meus Pedidos",
                  href: "/orders",
                },
                {
                  icon: Heart,
                  label: "Favoritos",
                  href: "/favorites",
                },
                {
                  icon: Star,
                  label: "Minhas Avaliações",
                  href: "/reviews",
                },
                {
                  icon: CreditCard,
                  label: "Cartões e Pagamento",
                  href: "/payment-methods",
                },
              ]}
            />

            <MenuSection
              title="Configurações"
              items={[
                {
                  icon: Bell,
                  label: "Notificações",
                  href: "/notifications",
                },
                {
                  icon: Shield,
                  label: "Privacidade e Segurança",
                  href: "/privacy",
                },
              ]}
            />

            <MenuSection
              title="Suporte"
              items={[
                {
                  icon: HelpCircle,
                  label: "Central de Ajuda",
                  href: "/help",
                },
                {
                  icon: FileText,
                  label: "Termos e Políticas",
                  href: "/terms",
                },
                {
                  icon: LogOut,
                  label: "Sair da Conta",
                  color: "text-red-600",
                  onClick: () => {
                    // TODO: Implement logout
                    console.log("Logout");
                  },
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/categories"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1">Categorias</span>
          </Link>
          <Link
            to="/cart"
            className="flex flex-col items-center justify-center text-muted-foreground relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Carrinho</span>
          </Link>
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Pedidos</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center text-primary"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Conta</span>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
