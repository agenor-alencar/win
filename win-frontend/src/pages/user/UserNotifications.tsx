import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, Truck, ShoppingCart, Star, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "order" | "delivery" | "promotion" | "review";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const notificationIcons = {
  order: Package,
  delivery: Truck,
  promotion: ShoppingCart,
  review: Star,
};

export default function UserNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // TODO: Implementar chamada à API
      setNotifications([]);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // TODO: Implementar chamada à API
      setNotifications(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar como lida.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Implementar chamada à API
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas como lidas.",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificações</h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `Você tem ${unreadCount} ${unreadCount === 1 ? "notificação não lida" : "notificações não lidas"}`
                  : "Todas as notificações foram lidas"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma notificação
                </h3>
                <p className="text-gray-500">
                  Você será notificado sobre atualizações de pedidos e promoções
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const IconComponent = notificationIcons[notification.type];
                
                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${
                      notification.read ? "bg-white" : "bg-blue-50"
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            notification.read ? "bg-gray-100" : "bg-blue-100"
                          }`}
                        >
                          <IconComponent
                            className={`h-5 w-5 ${
                              notification.read ? "text-gray-600" : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge className="ml-2">Nova</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
