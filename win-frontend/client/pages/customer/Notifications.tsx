import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Package,
  CreditCard,
  Star,
  Gift,
  AlertCircle,
  CheckCircle,
  Truck,
  Clock,
  Trash2,
  Settings,
} from "lucide-react";
import Header from "../../components/Header";

interface Notification {
  id: string;
  type: "order" | "payment" | "delivery" | "promotion" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "delivery",
    title: "Pedido entregue!",
    message: "Seu pedido #WIN2024001 foi entregue com sucesso.",
    timestamp: "2024-01-16T16:30:00",
    read: false,
    actionUrl: "/order/WIN2024001",
  },
  {
    id: "2",
    type: "order",
    title: "Pedido saiu para entrega",
    message: "Carlos está levando seu pedido #WIN2024002 até você.",
    timestamp: "2024-01-16T10:45:00",
    read: false,
    actionUrl: "/order/WIN2024002",
  },
  {
    id: "3",
    type: "promotion",
    title: "Oferta especial para você!",
    message: "20% de desconto em toda linha de ferramentas até domingo.",
    timestamp: "2024-01-16T09:00:00",
    read: true,
    actionUrl: "/category/ferragens",
  },
  {
    id: "4",
    type: "payment",
    title: "Pagamento aprovado",
    message: "Pagamento do pedido #WIN2024002 foi aprovado via PIX.",
    timestamp: "2024-01-16T09:15:00",
    read: true,
    actionUrl: "/order/WIN2024002",
  },
  {
    id: "5",
    type: "system",
    title: "Novo recurso disponível",
    message: "Agora você pode rastrear seus pedidos em tempo real!",
    timestamp: "2024-01-15T14:00:00",
    read: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5" />;
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      case "delivery":
        return <Truck className="h-5 w-5" />;
      case "promotion":
        return <Gift className="h-5 w-5" />;
      case "system":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-600";
      case "payment":
        return "text-green-600";
      case "delivery":
        return "text-orange-600";
      case "promotion":
        return "text-purple-600";
      case "system":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(
      notifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    );
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeTab);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `há ${diffInMinutes} min`;
    }
    if (diffInHours < 24) {
      return `há ${diffInHours}h`;
    }
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Bell className="h-8 w-8 mr-3" />
              Notifica��ões
              {unreadCount > 0 && (
                <Badge className="ml-3 bg-red-500">{unreadCount} novas</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Acompanhe atualizações sobre seus pedidos e ofertas
            </p>
          </div>

          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full mb-6">
            <TabsTrigger value="all">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">Não lidas ({unreadCount})</TabsTrigger>
            <TabsTrigger value="order">Pedidos</TabsTrigger>
            <TabsTrigger value="delivery">Entrega</TabsTrigger>
            <TabsTrigger value="promotion">Ofertas</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {getFilteredNotifications().length > 0 ? (
                getFilteredNotifications().map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read
                        ? "border-l-4 border-l-primary bg-blue-50/50"
                        : ""
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`mt-1 ${getIconColor(
                              notification.type,
                            )}`}
                          >
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${
                                !notification.read ? "text-primary" : ""
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      {activeTab === "unread"
                        ? "Nenhuma notificação não lida"
                        : "Nenhuma notificação"}
                    </h3>
                    <p className="text-muted-foreground">
                      {activeTab === "unread"
                        ? "Todas as suas notificações foram lidas"
                        : "Você será notificado sobre atualizações importantes aqui"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notification Settings Info */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Personalize suas Notificações
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  Configure quais notificações você deseja receber por e-mail,
                  SMS ou push.
                </p>
                <Button variant="outline" size="sm">
                  Ir para Configurações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
