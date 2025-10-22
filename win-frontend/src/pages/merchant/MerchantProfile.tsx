import React, { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { MerchantLayout } from "@/components/MerchantLayout";
import { api } from "@/lib/Api";

// TypeScript interfaces
interface Lojista {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  cnpj: string;
  nomeFantasia: string;
  razaoSocial: string;
  descricao: string;
  telefone: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export default function MerchantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const [isActive, setIsActive] = useState(true);
  const { success, error: showError } = useNotification();

  const [notifications, setNotifications] = useState({
    newOrders: true,
    paymentConfirmed: true,
    lowStock: true,
    reviews: false,
  });

  const [storeInfo, setStoreInfo] = useState({
    storeName: "",
    legalName: "",
    description: "",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    phone: "",
    email: "",
    cnpj: "",
    cpf: "123.456.789-00",
  });

  // Buscar dados do lojista
  useEffect(() => {
    fetchLojistaData();
  }, []);

  const fetchLojistaData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/lojistas/me");
      const data: Lojista = response.data;
      
      setLojista(data);
      setIsActive(data.ativo);
      
      // Atualizar formulário com dados reais
      setStoreInfo({
        storeName: data.nomeFantasia || "",
        legalName: data.razaoSocial || "",
        description: data.descricao || "",
        address: "Rua das Flores, 123 - Centro, São Paulo - SP", // TODO: Adicionar endereço no backend
        phone: data.telefone || "",
        email: data.usuarioEmail || "",
        cnpj: data.cnpj || "",
        cpf: "123.456.789-00", // TODO: Adicionar CPF no backend
      });
    } catch (err: any) {
      console.error("Erro ao buscar dados do lojista:", err);
      showError(
        "Erro ao carregar perfil",
        err.response?.data?.message || "Não foi possível carregar os dados da loja"
      );
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!lojista) return;

    try {
      setSaving(true);

      const updateData = {
        cnpj: storeInfo.cnpj,
        nomeFantasia: storeInfo.storeName,
        razaoSocial: storeInfo.legalName,
        descricao: storeInfo.description,
        telefone: storeInfo.phone,
      };

      await api.put(`/api/v1/lojistas/${lojista.id}`, updateData);
      
      success("Perfil atualizado!", "Todas as alterações foram salvas com sucesso");
      
      // Recarregar dados atualizados
      await fetchLojistaData();
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      showError(
        "Erro ao salvar",
        err.response?.data?.message || "Não foi possível salvar as alterações"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-[#3DBEAB]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Perfil da Loja
              </h1>
              <p className="text-sm text-gray-600">
                Configure as informações da sua loja
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="h-12 text-white font-medium bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-xl"
          >
            {saving ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-[#3DBEAB] mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados da loja...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
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
        )}
      </div>
    </MerchantLayout>
  );
}
