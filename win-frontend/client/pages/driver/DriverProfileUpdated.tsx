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
  ChevronRight,
  ArrowRight,
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

export default function DriverProfileUpdated() {
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
          label: status,
          color: "#6B7280",
          bg: "#F9FAFB",
          icon: Clock,
        };
    }
  };

  const statusInfo = getStatusInfo(driver.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F8FFFE", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <header
        className="bg-white shadow-sm p-4"
        style={{ borderBottom: "1px solid #E1F5FE" }}
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
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: "white", color: "#666666" }}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#333333",
                    }}
                  >
                    {driver.name}
                  </h2>
                  <Badge
                    style={{
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      border: "none",
                      fontSize: "11px",
                      padding: "4px 8px",
                    }}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      <Star
                        className="h-4 w-4 fill-current"
                        style={{ color: "#F59E0B" }}
                      />
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#333333",
                        }}
                      >
                        {driver.rating}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#666666" }}>
                      Avaliação
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#333333",
                      }}
                    >
                      {driver.totalDeliveries}
                    </p>
                    <p style={{ fontSize: "11px", color: "#666666" }}>
                      Entregas
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#10B981",
                      }}
                    >
                      R$ {driver.earnings.today.toFixed(2)}
                    </p>
                    <p style={{ fontSize: "11px", color: "#666666" }}>Hoje</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/driver/banking">
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#E8F5E8" }}
                    >
                      <Banknote
                        className="h-5 w-5"
                        style={{ color: "#10B981" }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#333333",
                        }}
                      >
                        Contas Bancárias
                      </p>
                      <p style={{ fontSize: "11px", color: "#666666" }}>
                        Gerenciar recebimentos
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-5 w-5"
                    style={{ color: "#666666" }}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card
            className="cursor-pointer transition-all hover:shadow-md"
            style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#E8F4FD" }}
                  >
                    <Settings
                      className="h-5 w-5"
                      style={{ color: "#3B82F6" }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#333333",
                      }}
                    >
                      Configurações
                    </p>
                    <p style={{ fontSize: "11px", color: "#666666" }}>
                      Notificações e privacidade
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="h-5 w-5"
                  style={{ color: "#666666" }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Summary */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between"
              style={{ fontSize: "16px", color: "#333333" }}
            >
              <span>Resumo de Ganhos</span>
              <Link to="/driver/history">
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderRadius: "8px", fontSize: "11px" }}
                >
                  Ver Histórico
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>Hoje</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#10B981",
                  }}
                >
                  R$ {driver.earnings.today.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Esta Semana
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#3B82F6",
                  }}
                >
                  R$ {driver.earnings.thisWeek.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "#666666" }}>Este Mês</p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#8B5CF6",
                  }}
                >
                  R$ {driver.earnings.thisMonth.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center"
              style={{ fontSize: "16px", color: "#333333" }}
            >
              <Car className="h-5 w-5 mr-2" style={{ color: "#666666" }} />
              Informações do Veículo
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
          <CardHeader>
            <CardTitle
              className="flex items-center"
              style={{ fontSize: "16px", color: "#333333" }}
            >
              <FileText className="h-5 w-5 mr-2" style={{ color: "#666666" }} />
              Status dos Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "14px", color: "#333333" }}>CNH</span>
              <div className="flex items-center space-x-2">
                <Badge
                  style={{
                    backgroundColor: "#F0FDF4",
                    color: "#10B981",
                    border: "none",
                    fontSize: "11px",
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aprovado
                </Badge>
                <span style={{ fontSize: "11px", color: "#666666" }}>
                  Válida até {driver.documents.cnh.expiryDate}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "14px", color: "#333333" }}>
                Verificação de Perfil
              </span>
              <Badge
                style={{
                  backgroundColor: "#F0FDF4",
                  color: "#10B981",
                  border: "none",
                  fontSize: "11px",
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Verificado
              </Badge>
            </div>
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
