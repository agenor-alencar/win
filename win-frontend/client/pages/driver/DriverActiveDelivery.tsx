import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  MapPin,
  Store,
  User,
  Phone,
  Package,
  Clock,
  Navigation,
  CheckCircle,
  Hash,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

// Mock data - in real app this would come from the order ID
const mockOrder = {
  id: "WIN001",
  status: "accepted", // accepted, picked_up, delivered
  store: {
    name: "Ferragens Silva",
    address: "Rua das Flores, 123 - Centro",
    phone: "(11) 3333-4444",
    distance: 1.2,
  },
  customer: {
    name: "Maria Silva",
    address: "Av. Paulista, 456 - Bela Vista",
    phone: "(11) 99999-1234",
    distance: 3.5,
  },
  items: [
    { name: "Parafuso Phillips 3x20mm", quantity: 2, price: 12.5 },
    { name: "Porca M8", quantity: 5, price: 0.75 },
  ],
  totalValue: 28.75,
  deliveryFee: 8.5,
  estimatedTime: "25 min",
  pickupCode: "845672",
  deliveryCode: null, // Will be generated when customer receives
  createdAt: "14:30",
};

export default function DriverActiveDelivery() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(mockOrder);
  const [inputCode, setInputCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const { success, error: notifyError } = useNotification();

  const handleArrivedAtStore = () => {
    success("Chegada confirmada!", "Informe o código para retirar o pedido");
    // In real app, this would notify the store
  };

  const handlePickupConfirmation = () => {
    if (inputCode !== order.pickupCode) {
      notifyError("Código incorreto", "Verifique o código com a loja");
      return;
    }

    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setOrder((prev) => ({ ...prev, status: "picked_up" }));
      success("Retirada confirmada!", "Agora vá entregar ao cliente");
      setInputCode("");
    }, 2000);
  };

  const handleDeliveryConfirmation = () => {
    if (inputCode.length !== 6) {
      notifyError("Código inválido", "O código do cliente deve ter 6 dígitos");
      return;
    }

    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setOrder((prev) => ({ ...prev, status: "delivered" }));
      success("Entrega concluída!", "Parabéns! Entrega realizada com sucesso");
      setTimeout(() => {
        window.location.href = "/driver/dashboard";
      }, 3000);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success("Copiado!", "Código copiado para a área de transferência");
  };

  const getStatusInfo = () => {
    switch (order.status) {
      case "accepted":
        return {
          title: "Indo para a Loja",
          description: "Dirija-se até a loja para retirar o pedido",
          color: "#F59E0B",
          bg: "#FFF7ED",
          icon: Navigation,
        };
      case "picked_up":
        return {
          title: "Produto Retirado",
          description: "Agora dirija-se até o cliente para entrega",
          color: "#2D9CDB",
          bg: "#F0F9FF",
          icon: Truck,
        };
      case "delivered":
        return {
          title: "Entrega Concluída",
          description: "Parabéns! Entrega realizada com sucesso",
          color: "#10B981",
          bg: "#F0FDF4",
          icon: CheckCircle,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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
            <Link to="/driver/dashboard" className="mr-3">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Entrega #{order.id}
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Criado às {order.createdAt}
              </p>
            </div>
          </div>

          <Badge
            style={{
              backgroundColor: statusInfo.bg,
              color: statusInfo.color,
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.title}
          </Badge>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Status Card */}
        <Card
          className="mb-6"
          style={{
            borderRadius: "16px",
            border: `2px solid ${statusInfo.color}20`,
            backgroundColor: statusInfo.bg,
          }}
        >
          <CardContent className="p-6 text-center">
            <StatusIcon
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: statusInfo.color }}
            />
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: statusInfo.color,
                marginBottom: "8px",
              }}
            >
              {statusInfo.title}
            </h2>
            <p style={{ fontSize: "14px", color: statusInfo.color }}>
              {statusInfo.description}
            </p>
          </CardContent>
        </Card>

        {/* Route Progress */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              Rota da Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Store */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "accepted"
                      ? "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB]"
                      : "bg-green-500"
                  }`}
                >
                  {order.status === "accepted" ? (
                    <Store className="h-4 w-4 text-white" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    {order.store.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    {order.store.address}
                  </p>
                  <p style={{ fontSize: "12px", color: "#F59E0B" }}>
                    {order.store.distance} km • {order.store.phone}
                  </p>
                </div>
              </div>

              {/* Connection Line */}
              <div className="flex items-center ml-4">
                <div
                  className="w-px h-8"
                  style={{
                    backgroundColor:
                      order.status === "picked_up" ||
                      order.status === "delivered"
                        ? "#10B981"
                        : "#E5E7EB",
                  }}
                />
              </div>

              {/* Customer */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "delivered"
                      ? "bg-green-500"
                      : order.status === "picked_up"
                        ? "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB]"
                        : "bg-gray-200"
                  }`}
                >
                  {order.status === "delivered" ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <MapPin
                      className={`h-4 w-4 ${
                        order.status === "picked_up"
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    {order.customer.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    {order.customer.address}
                  </p>
                  <p style={{ fontSize: "12px", color: "#10B981" }}>
                    {order.customer.distance} km • {order.customer.phone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="pb-4">
            <CardTitle style={{ fontSize: "18px", color: "#333333" }}>
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: "#F8F9FA" }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#333333",
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666666" }}>
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#333333",
                    }}
                  >
                    R${" "}
                    {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="flex justify-between items-center p-4 rounded-lg"
              style={{ backgroundColor: "#F0FDF4" }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#333333",
                  }}
                >
                  Total do Pedido
                </p>
                <p style={{ fontSize: "12px", color: "#666666" }}>
                  Sua comissão: R${" "}
                  {order.deliveryFee.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#10B981",
                }}
              >
                R$ {order.totalValue.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        {order.status === "accepted" && (
          <Card style={{ borderRadius: "16px", border: "1px solid #FED7AA" }}>
            <CardContent className="p-6">
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333333",
                  marginBottom: "16px",
                }}
              >
                Retirada na Loja
              </h3>

              <div className="space-y-4">
                <Button
                  onClick={handleArrivedAtStore}
                  variant="outline"
                  className="w-full h-12"
                  style={{
                    borderRadius: "12px",
                    borderColor: "#F59E0B",
                    color: "#F59E0B",
                  }}
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Cheguei à Loja
                </Button>

                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#333333",
                      marginBottom: "12px",
                    }}
                  >
                    Código de Retirada:
                  </p>
                  <div
                    className="flex items-center justify-center p-4 rounded-lg mb-4"
                    style={{ backgroundColor: "#FFF7ED" }}
                  >
                    <Hash
                      className="h-6 w-6 mr-2"
                      style={{ color: "#F59E0B" }}
                    />
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#F59E0B",
                        fontFamily: "monospace",
                        letterSpacing: "4px",
                      }}
                    >
                      {order.pickupCode}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(order.pickupCode)}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#333333",
                      marginBottom: "8px",
                    }}
                  >
                    Confirmar Retirada:
                  </p>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Digite o código fornecido pela loja"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      maxLength={6}
                      className="flex-1"
                      style={{
                        borderRadius: "12px",
                        fontFamily: "monospace",
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    />
                    <Button
                      onClick={handlePickupConfirmation}
                      disabled={inputCode.length !== 6 || isConfirming}
                      style={{
                        backgroundColor: "#F59E0B",
                        borderRadius: "12px",
                      }}
                    >
                      {isConfirming ? "Confirmando..." : "Confirmar"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "picked_up" && (
          <Card style={{ borderRadius: "16px", border: "1px solid #A7F3D0" }}>
            <CardContent className="p-6">
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333333",
                  marginBottom: "16px",
                }}
              >
                Entrega ao Cliente
              </h3>

              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#F0FDF4" }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#059669",
                      marginBottom: "8px",
                    }}
                  >
                    ✅ Produto retirado na loja com sucesso!
                  </p>
                  <p style={{ fontSize: "12px", color: "#047857" }}>
                    Agora dirija-se até o endereço do cliente para finalizar a
                    entrega.
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#333333",
                      marginBottom: "8px",
                    }}
                  >
                    Código do Cliente:
                  </p>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Digite o código fornecido pelo cliente"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      maxLength={6}
                      className="flex-1"
                      style={{
                        borderRadius: "12px",
                        fontFamily: "monospace",
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    />
                    <Button
                      onClick={handleDeliveryConfirmation}
                      disabled={inputCode.length !== 6 || isConfirming}
                      style={{
                        backgroundColor: "#10B981",
                        borderRadius: "12px",
                      }}
                    >
                      {isConfirming ? "Finalizando..." : "Entregar"}
                    </Button>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#666666",
                      marginTop: "8px",
                    }}
                  >
                    Solicite o código de 6 dígitos ao cliente antes de entregar
                    o produto
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "delivered" && (
          <Card style={{ borderRadius: "16px", border: "1px solid #A7F3D0" }}>
            <CardContent className="p-8 text-center">
              <CheckCircle
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: "#10B981" }}
              />
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#10B981",
                  marginBottom: "8px",
                }}
              >
                Entrega Concluída!
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#047857",
                  marginBottom: "16px",
                }}
              >
                Parabéns! Você ganhou R${" "}
                {order.deliveryFee.toFixed(2).replace(".", ",")} nesta entrega.
              </p>
              <Button
                asChild
                style={{
                  background:
                    "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                  borderRadius: "12px",
                }}
              >
                <Link to="/driver/dashboard">Buscar Novos Pedidos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
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
            style={{ color: "#3DBEAB" }}
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
            style={{ color: "#666666" }}
          >
            <User className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
