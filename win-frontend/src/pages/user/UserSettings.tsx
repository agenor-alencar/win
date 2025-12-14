import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bell, Shield, Eye, Mail } from "lucide-react";

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    },
    privacy: {
      profilePublic: false,
      showEmail: false,
      showPhone: false,
    },
    preferences: {
      language: "pt-BR",
      currency: "BRL",
      theme: "light",
    },
  });

  const handleSave = async () => {
    try {
      // TODO: Implementar chamada à API
      toast({
        title: "Configurações salvas!",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
            <p className="text-gray-600">Gerencie suas preferências e privacidade</p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="privacy">Privacidade</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
            </TabsList>

            {/* Notificações */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle>Notificações</CardTitle>
                      <CardDescription>
                        Escolha como deseja receber notificações
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Canais de Notificação</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notif" className="font-medium">
                          Notificações por E-mail
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receba atualizações no seu e-mail
                        </p>
                      </div>
                      <Switch
                        id="email-notif"
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", "email", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notif" className="font-medium">
                          Notificações Push
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receba notificações no navegador
                        </p>
                      </div>
                      <Switch
                        id="push-notif"
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", "push", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notif" className="font-medium">
                          Notificações por SMS
                        </Label>
                        <p className="text-sm text-gray-500">
                          Receba SMS para atualizações importantes
                        </p>
                      </div>
                      <Switch
                        id="sms-notif"
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", "sms", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Tipos de Notificação</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="order-updates" className="font-medium">
                          Atualizações de Pedidos
                        </Label>
                        <p className="text-sm text-gray-500">
                          Status de entrega e rastreamento
                        </p>
                      </div>
                      <Switch
                        id="order-updates"
                        checked={settings.notifications.orderUpdates}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", "orderUpdates", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="promotions" className="font-medium">
                          Promoções e Ofertas
                        </Label>
                        <p className="text-sm text-gray-500">
                          Descontos e lançamentos
                        </p>
                      </div>
                      <Switch
                        id="promotions"
                        checked={settings.notifications.promotions}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", "promotions", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newsletter" className="font-medium">
                          Newsletter
                        </Label>
                        <p className="text-sm text-gray-500">
                          Novidades e conteúdos exclusivos
                        </p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={settings.notifications.newsletter}
                        onCheckedChange={(checked) =>
                          updateSetting("notifications", "newsletter", checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacidade */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle>Privacidade</CardTitle>
                      <CardDescription>
                        Controle quem pode ver suas informações
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-public" className="font-medium">
                        Perfil Público
                      </Label>
                      <p className="text-sm text-gray-500">
                        Permitir que outros usuários vejam seu perfil
                      </p>
                    </div>
                    <Switch
                      id="profile-public"
                      checked={settings.privacy.profilePublic}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", "profilePublic", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-email" className="font-medium">
                        Mostrar E-mail
                      </Label>
                      <p className="text-sm text-gray-500">
                        Exibir seu e-mail no perfil público
                      </p>
                    </div>
                    <Switch
                      id="show-email"
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", "showEmail", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-phone" className="font-medium">
                        Mostrar Telefone
                      </Label>
                      <p className="text-sm text-gray-500">
                        Exibir seu telefone no perfil público
                      </p>
                    </div>
                    <Switch
                      id="show-phone"
                      checked={settings.privacy.showPhone}
                      onCheckedChange={(checked) =>
                        updateSetting("privacy", "showPhone", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferências */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle>Preferências</CardTitle>
                      <CardDescription>
                        Personalize sua experiência
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Idioma</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Selecione seu idioma preferido
                    </p>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={settings.preferences.language}
                      onChange={(e) =>
                        updateSetting("preferences", "language", e.target.value)
                      }
                      aria-label="Selecionar idioma"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium">Moeda</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Moeda para exibição de preços
                    </p>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={settings.preferences.currency}
                      onChange={(e) =>
                        updateSetting("preferences", "currency", e.target.value)
                      }
                      aria-label="Selecionar moeda"
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium">Tema</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Aparência da interface
                    </p>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={settings.preferences.theme}
                      onChange={(e) =>
                        updateSetting("preferences", "theme", e.target.value)
                      }
                      aria-label="Selecionar tema"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} size="lg">
              Salvar Configurações
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
