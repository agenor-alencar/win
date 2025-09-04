import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Car,
  Star,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  Edit,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertTriangle,
  Truck,
  Navigation,
  Banknote,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

// Mock driver data
const driverData = {
  id: "DRV001",
  name: "Carlos Silva",
  email: "carlos.silva@email.com",
  phone: "(11) 99999-9999",
  document: "123.456.789-00",
  rating: 4.8,
  totalDeliveries: 124,
  memberSince: "2023-06-15",
  status: "active", // active, inactive, suspended
  profilePhoto: "/placeholder.svg",

  vehicle: {
    type: "Moto",
    model: "Honda CG 160",
    year: "2022",
    color: "Vermelha",
    plate: "ABC-1234",
  },

  documents: {
    cnh: {
      status: "approved",
      expiryDate: "2027-12-15",
    },
    profileVerification: {
      status: "approved",
      verifiedAt: "2023-06-16",
    },
  },

  settings: {
    notifications: {
      newOrders: true,
      orderUpdates: true,
      promotions: false,
      marketing: false,
    },
    availability: {
      monday: { active: true, start: "08:00", end: "18:00" },
      tuesday: { active: true, start: "08:00", end: "18:00" },
      wednesday: { active: true, start: "08:00", end: "18:00" },
      thursday: { active: true, start: "08:00", end: "18:00" },
      friday: { active: true, start: "08:00", end: "18:00" },
      saturday: { active: true, start: "08:00", end: "14:00" },
      sunday: { active: false, start: "", end: "" },
    },
  },

  earnings: {
    today: 45.5,
    thisWeek: 234.75,
    thisMonth: 1050.25,
  },
};

export default function DriverProfile() {
  const [driver, setDriver] = useState(driverData);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { success, info } = useNotification();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Ativo",
          color: "#10B981",
          bg: "#F0FDF4",
          icon: CheckCircle,
        };
      case "inactive":
        return {
          label: "Inativo",
          color: "#6B7280",
          bg: "#F9FAFB",
          icon: Clock,
        };
      case "suspended":
        return {
          label: "Suspenso",
          color: "#EF4444",
          bg: "#FEF2F2",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "Desconhecido",
          color: "#6B7280",
          bg: "#F9FAFB",
          icon: User,
        };
    }
  };

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Aprovado",
          color: "#10B981",
          bg: "#F0FDF4",
          icon: CheckCircle,
        };
      case "pending":
        return {
          label: "Pendente",
          color: "#F59E0B",
          bg: "#FFF7ED",
          icon: Clock,
        };
      case "rejected":
        return {
          label: "Rejeitado",
          color: "#EF4444",
          bg: "#FEF2F2",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "Não enviado",
          color: "#6B7280",
          bg: "#F9FAFB",
          icon: FileText,
        };
    }
  };

  const handleLogout = () => {
    info("Logout realizado", "Você foi desconectado com sucesso");
    setTimeout(() => {
      window.location.href = "/driver/login";
    }, 1500);
  };

  const statusInfo = getStatusInfo(driver.status);
  const StatusIcon = statusInfo.icon;

  const cnhStatus = getDocumentStatus(driver.documents.cnh.status);
  const profileStatus = getDocumentStatus(
    driver.documents.profileVerification.status,
  );

  const weekDays = [
    { key: "monday", label: "Segunda" },
    { key: "tuesday", label: "Terça" },
    { key: "wednesday", label: "Quarta" },
    { key: "thursday", label: "Quinta" },
    { key: "friday", label: "Sexta" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#F8FFFE",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-4 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E1F5FE" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Meu Perfil
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Gerencie suas informações e configurações
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowEditProfile(!showEditProfile)}
            variant="outline"
            style={{ borderRadius: "12px", color: "#666666" }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Profile Header */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                  }}
                >
                  {driver.profilePhoto ? (
                    <img
                      src={driver.profilePhoto}
                      alt={driver.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    {driver.name}
                  </h2>
                  <Badge
                    style={{
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      fontSize: "12px",
                    }}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#666666",
                    marginBottom: "8px",
                  }}
                >
                  Motorista desde{" "}
                  {new Date(driver.memberSince).toLocaleDateString("pt-BR")}
                </p>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" style={{ color: "#F59E0B" }} />
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#333333",
                      }}
                    >
                      {driver.rating}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666666" }}>
                      ({driver.totalDeliveries} entregas)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Summary */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              Ganhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Hoje</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#10B981",
                  }}
                >
                  R$ {driver.earnings.today.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Esta Semana
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#2D9CDB",
                  }}
                >
                  R$ {driver.earnings.thisWeek.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#666666" }}>Este Mês</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#3DBEAB",
                  }}
                >
                  R$ {driver.earnings.thisMonth.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              <Car className="h-5 w-5 mr-2 inline" />
              Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>Tipo</p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  {driver.vehicle.type}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>Modelo</p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  {driver.vehicle.model}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>Ano</p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  {driver.vehicle.year}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>Cor</p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  {driver.vehicle.color}
                </p>
              </div>
              <div className="col-span-2">
                <p style={{ fontSize: "12px", color: "#666666" }}>Placa</p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#333333",
                    fontFamily: "monospace",
                  }}
                >
                  {driver.vehicle.plate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Status */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              <Shield className="h-5 w-5 mr-2 inline" />
              Documentação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#F8F9FA" }}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5" style={{ color: "#666666" }} />
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    CNH
                  </p>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Válida até{" "}
                    {new Date(
                      driver.documents.cnh.expiryDate,
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <Badge
                style={{
                  backgroundColor: cnhStatus.bg,
                  color: cnhStatus.color,
                  fontSize: "11px",
                }}
              >
                <cnhStatus.icon className="h-3 w-3 mr-1" />
                {cnhStatus.label}
              </Badge>
            </div>

            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#F8F9FA" }}
            >
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5" style={{ color: "#666666" }} />
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#333333",
                    }}
                  >
                    Verificação de Perfil
                  </p>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Verificado em{" "}
                    {new Date(
                      driver.documents.profileVerification.verifiedAt,
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <Badge
                style={{
                  backgroundColor: profileStatus.bg,
                  color: profileStatus.color,
                  fontSize: "11px",
                }}
              >
                <profileStatus.icon className="h-3 w-3 mr-1" />
                {profileStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              <Bell className="h-5 w-5 mr-2 inline" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  Novos Pedidos
                </p>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Receber notificação de novos pedidos disponíveis
                </p>
              </div>
              <Switch
                checked={driver.settings.notifications.newOrders}
                onCheckedChange={(checked) => {
                  setDriver((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      notifications: {
                        ...prev.settings.notifications,
                        newOrders: checked,
                      },
                    },
                  }));
                  success(
                    "Configuração atualizada!",
                    "Preferência de notificação salva",
                  );
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  Atualizações de Pedidos
                </p>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Notificações sobre status dos pedidos em andamento
                </p>
              </div>
              <Switch
                checked={driver.settings.notifications.orderUpdates}
                onCheckedChange={(checked) => {
                  setDriver((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      notifications: {
                        ...prev.settings.notifications,
                        orderUpdates: checked,
                      },
                    },
                  }));
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333333",
                  }}
                >
                  Promoções
                </p>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Ofertas especiais e bonificações
                </p>
              </div>
              <Switch
                checked={driver.settings.notifications.promotions}
                onCheckedChange={(checked) => {
                  setDriver((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      notifications: {
                        ...prev.settings.notifications,
                        promotions: checked,
                      },
                    },
                  }));
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              style={{ borderRadius: "12px", fontSize: "16px" }}
            >
              <Settings className="h-5 w-5 mr-3" />
              Configurações Avançadas
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12"
              style={{ borderRadius: "12px", fontSize: "16px" }}
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              Central de Ajuda
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-12"
              style={{
                borderRadius: "12px",
                fontSize: "16px",
                borderColor: "#EF4444",
                color: "#EF4444",
              }}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" style={{ color: "#666666" }} />
                <span style={{ fontSize: "14px", color: "#333333" }}>
                  {driver.email}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" style={{ color: "#666666" }} />
                <span style={{ fontSize: "14px", color: "#333333" }}>
                  {driver.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4" style={{ color: "#666666" }} />
                <span style={{ fontSize: "14px", color: "#333333" }}>
                  CPF: {driver.document}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
        style={{ borderColor: "#E1F5FE" }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/driver/dashboard"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Truck className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Pedidos</span>
          </Link>
          <Link
            to="/driver/active"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Navigation className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Ativa</span>
          </Link>
          <Link
            to="/driver/history"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Clock className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>
              Histórico
            </span>
          </Link>
          <Link
            to="/driver/profile"
            className="flex flex-col items-center justify-center"
            style={{ color: "#3DBEAB" }}
          >
            <User className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
