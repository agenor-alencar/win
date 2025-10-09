import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Store,
  Camera,
  Save,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Bell,
  Settings,
  Shield,
  Package,
  ShoppingBag,
  User,
  FileText,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

export default function MerchantProfile() {
  const [isActive, setIsActive] = useState(true);
  const { success } = useNotification();

  const [notifications, setNotifications] = useState({
    newOrders: true,
    paymentConfirmed: true,
    lowStock: true,
    reviews: false,
  });

  const [storeInfo, setStoreInfo] = useState({
    storeName: "Ferragens Silva",
    legalName: "Silva Comércio de Ferragens Ltda",
    description:
      "Loja especializada em ferragens, ferramentas e materiais de construção. Atendemos toda a região metropolitana com produtos de qualidade.",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    phone: "(11) 3333-4444",
    email: "contato@ferragenssilva.com.br",
    cnpj: "12.345.678/0001-90",
    cpf: "123.456.789-00",
  });

  const [workingHours, setWorkingHours] = useState({
    monday: { open: "08:00", close: "18:00", closed: false },
    tuesday: { open: "08:00", close: "18:00", closed: false },
    wednesday: { open: "08:00", close: "18:00", closed: false },
    thursday: { open: "08:00", close: "18:00", closed: false },
    friday: { open: "08:00", close: "18:00", closed: false },
    saturday: { open: "08:00", close: "12:00", closed: false },
    sunday: { open: "", close: "", closed: true },
  });

  const weekDays = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const updateWorkingHour = (day: string, field: string, value: any) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    success("Perfil atualizado!", "Todas as alterações foram salvas");
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Store className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Perfil da Loja
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Configure as informações da sua loja
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="h-12 text-white font-medium"
            style={{
              backgroundColor: "#3DBEAB",
              borderRadius: "12px",
              fontSize: "16px",
            }}
          >
            <Save className="h-5 w-5 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Store Banner and Basic Info */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle
                style={{
                  fontSize: "20px",
                  color: "#333333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Store className="h-6 w-6 mr-2" style={{ color: "#3DBEAB" }} />
                Informações da Loja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Photo */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                    }}
                  >
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    style={{ borderRadius: "50%" }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="storeName"
                    style={{ fontSize: "16px", color: "#333333" }}
                  >
                    Nome Fantasia *
                  </Label>
                  <Input
                    id="storeName"
                    value={storeInfo.storeName}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, storeName: e.target.value })
                    }
                    className="mt-2 h-12"
                    style={{ borderRadius: "12px", fontSize: "16px" }}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="legalName"
                  style={{ fontSize: "16px", color: "#333333" }}
                >
                  Razão Social *
                </Label>
                <Input
                  id="legalName"
                  value={storeInfo.legalName}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, legalName: e.target.value })
                  }
                  className="mt-2 h-12"
                  style={{ borderRadius: "12px", fontSize: "16px" }}
                />
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  style={{ fontSize: "16px", color: "#333333" }}
                >
                  Descrição da Loja
                </Label>
                <Textarea
                  id="description"
                  value={storeInfo.description}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, description: e.target.value })
                  }
                  className="mt-2"
                  style={{ borderRadius: "12px", fontSize: "16px" }}
                  rows={3}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="phone"
                    style={{ fontSize: "16px", color: "#333333" }}
                  >
                    Telefone *
                  </Label>
                  <div className="relative mt-2">
                    <Phone
                      className="absolute left-3 top-3 h-5 w-5"
                      style={{ color: "#6B7280" }}
                    />
                    <Input
                      id="phone"
                      value={storeInfo.phone}
                      onChange={(e) =>
                        setStoreInfo({ ...storeInfo, phone: e.target.value })
                      }
                      className="pl-10 h-12"
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    style={{ fontSize: "16px", color: "#333333" }}
                  >
                    E-mail *
                  </Label>
                  <div className="relative mt-2">
                    <Mail
                      className="absolute left-3 top-3 h-5 w-5"
                      style={{ color: "#6B7280" }}
                    />
                    <Input
                      id="email"
                      type="email"
                      value={storeInfo.email}
                      onChange={(e) =>
                        setStoreInfo({ ...storeInfo, email: e.target.value })
                      }
                      className="pl-10 h-12"
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="address"
                  style={{ fontSize: "16px", color: "#333333" }}
                >
                  Endereço Completo *
                </Label>
                <div className="relative mt-2">
                  <MapPin
                    className="absolute left-3 top-3 h-5 w-5"
                    style={{ color: "#6B7280" }}
                  />
                  <Textarea
                    id="address"
                    value={storeInfo.address}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, address: e.target.value })
                    }
                    className="pl-10"
                    style={{ borderRadius: "12px", fontSize: "16px" }}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="cnpj"
                    style={{ fontSize: "16px", color: "#333333" }}
                  >
                    CNPJ *
                  </Label>
                  <div className="relative mt-2">
                    <FileText
                      className="absolute left-3 top-3 h-5 w-5"
                      style={{ color: "#6B7280" }}
                    />
                    <Input
                      id="cnpj"
                      value={storeInfo.cnpj}
                      onChange={(e) =>
                        setStoreInfo({ ...storeInfo, cnpj: e.target.value })
                      }
                      className="pl-10 h-12"
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="cpf"
                    style={{ fontSize: "16px", color: "#333333" }}
                  >
                    CPF do Responsável *
                  </Label>
                  <div className="relative mt-2">
                    <User
                      className="absolute left-3 top-3 h-5 w-5"
                      style={{ color: "#6B7280" }}
                    />
                    <Input
                      id="cpf"
                      value={storeInfo.cpf}
                      onChange={(e) =>
                        setStoreInfo({ ...storeInfo, cpf: e.target.value })
                      }
                      className="pl-10 h-12"
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle
                style={{
                  fontSize: "20px",
                  color: "#333333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Clock className="h-6 w-6 mr-2" style={{ color: "#3DBEAB" }} />
                Horário de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weekDays.map((day) => (
                <div
                  key={day.key}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
                >
                  <div className="flex items-center space-x-4">
                    <span
                      className="font-medium w-32"
                      style={{ fontSize: "16px", color: "#333333" }}
                    >
                      {day.label}
                    </span>
                    <Switch
                      checked={!workingHours[day.key].closed}
                      onCheckedChange={(checked) =>
                        updateWorkingHour(day.key, "closed", !checked)
                      }
                    />
                    <span style={{ fontSize: "12px", color: "#666666" }}>
                      {workingHours[day.key].closed ? "Fechado" : "Aberto"}
                    </span>
                  </div>

                  {!workingHours[day.key].closed && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={workingHours[day.key].open}
                        onChange={(e) =>
                          updateWorkingHour(day.key, "open", e.target.value)
                        }
                        className="w-24 h-10"
                        style={{ borderRadius: "12px" }}
                      />
                      <span style={{ fontSize: "14px", color: "#666666" }}>
                        até
                      </span>
                      <Input
                        type="time"
                        value={workingHours[day.key].close}
                        onChange={(e) =>
                          updateWorkingHour(day.key, "close", e.target.value)
                        }
                        className="w-24 h-10"
                        style={{ borderRadius: "12px" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Store Status */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle
                style={{
                  fontSize: "20px",
                  color: "#333333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Settings
                  className="h-6 w-6 mr-2"
                  style={{ color: "#3DBEAB" }}
                />
                Status da Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: isActive ? "#F0FDF4" : "#FEF2F2",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    {isActive ? "Loja Ativa" : "Loja Temporariamente Pausada"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    {isActive
                      ? "Sua loja está visível para os clientes e recebendo pedidos"
                      : "Sua loja não está visível e não recebe novos pedidos"}
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle
                style={{
                  fontSize: "20px",
                  color: "#333333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Bell className="h-6 w-6 mr-2" style={{ color: "#3DBEAB" }} />
                Configurações de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Novos Pedidos
                  </h4>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Receber notificação quando há novos pedidos
                  </p>
                </div>
                <Switch
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newOrders: checked })
                  }
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Pagamento Confirmado
                  </h4>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Notificar quando um pagamento for confirmado
                  </p>
                </div>
                <Switch
                  checked={notifications.paymentConfirmed}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      paymentConfirmed: checked,
                    })
                  }
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Estoque Baixo
                  </h4>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Avisar quando produtos estão com estoque baixo
                  </p>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, lowStock: checked })
                  }
                />
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Avaliações
                  </h4>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Notificar sobre novas avaliações da loja
                  </p>
                </div>
                <Switch
                  checked={notifications.reviews}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, reviews: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardHeader className="pb-4">
              <CardTitle
                style={{
                  fontSize: "20px",
                  color: "#333333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Shield className="h-6 w-6 mr-2" style={{ color: "#3DBEAB" }} />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-12"
                style={{
                  borderRadius: "12px",
                  fontSize: "16px",
                  borderColor: "#E5E7EB",
                }}
              >
                Alterar Senha
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                style={{
                  borderRadius: "12px",
                  fontSize: "16px",
                  borderColor: "#E5E7EB",
                }}
              >
                Configurar Autenticação de Dois Fatores
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/merchant/dashboard"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Store className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>
              Dashboard
            </span>
          </Link>
          <Link
            to="/merchant/orders"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Package className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Pedidos</span>
          </Link>
          <Link
            to="/merchant/products"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <ShoppingBag className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Produtos</span>
          </Link>
          <Link
            to="/merchant/profile"
            className="flex flex-col items-center justify-center"
            style={{ color: "#3DBEAB" }}
          >
            <Settings className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
