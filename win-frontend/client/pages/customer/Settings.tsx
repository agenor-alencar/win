import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Moon,
  Smartphone,
  Mail,
  MessageSquare,
  Eye,
  Lock,
} from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      showProfile: true,
      showOrders: false,
      allowRecommendations: true,
    },
    preferences: {
      language: "pt-BR",
      currency: "BRL",
      theme: "light",
      autoLogin: true,
    },
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const saveSettings = () => {
    // TODO: Implement save settings
    console.log("Saving settings:", settings);
    alert("Configurações salvas com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações de conta
          </p>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Notificações por E-mail
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre pedidos por e-mail
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Notificações Push
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador sobre pedidos
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("push", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba SMS sobre status de entrega
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("sms", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba ofertas especiais e novidades
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("marketing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Perfil Público
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros usuários vejam seu perfil
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.showProfile}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showProfile", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Histórico de Pedidos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar histórico para recomendações
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.showOrders}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("showOrders", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Recomendações Personalizadas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Usar dados de compras para sugerir produtos
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.allowRecommendations}
                  onCheckedChange={(checked) =>
                    handlePrivacyChange("allowRecommendations", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">Idioma</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) =>
                      handlePreferenceChange("language", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Moeda</Label>
                  <Select
                    value={settings.preferences.currency}
                    onValueChange={(value) =>
                      handlePreferenceChange("currency", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Tema</Label>
                <Select
                  value={settings.preferences.theme}
                  onValueChange={(value) =>
                    handlePreferenceChange("theme", value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Login Automático
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Manter-se conectado neste dispositivo
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.autoLogin}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("autoLogin", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="h-4 w-4 mr-2" />
                Configurar Autenticação em Duas Etapas
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Ver Dispositivos Conectados
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Baixar Meus Dados
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                Excluir Conta
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={saveSettings}>Salvar Configurações</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
