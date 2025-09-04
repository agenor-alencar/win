import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Truck,
  Store,
  Globe,
  Mail,
  Smartphone,
  Lock,
  Eye,
  Save,
  AlertTriangle,
  Banknote,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import MerchantNavbar from "../../components/MerchantNavbar";

export default function MerchantSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { success } = useNotification();

  const [settings, setSettings] = useState({
    // Notificações
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    marketingEmails: false,
    lowStockAlerts: true,
    reviewNotifications: true,

    // Loja
    storeOpen: true,
    autoAcceptOrders: false,
    showStock: true,
    allowReviews: true,
    enableChat: true,

    // Envio
    freeShippingThreshold: 100,
    processingTime: "1-2",
    returnPolicy: 7,

    // Segurança
    twoFactorEnabled: false,
    sessionTimeout: 30,

    // SEO
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: "Banco do Brasil",
      bankCode: "001",
      agency: "1234-5",
      account: "12345-6",
      accountType: "corrente",
      holderName: "João Silva",
      holderDocument: "123.456.789-00",
      isPrimary: true,
    },
  ]);

  const [newAccount, setNewAccount] = useState({
    bankName: "",
    bankCode: "",
    agency: "",
    account: "",
    accountType: "corrente",
    holderName: "",
    holderDocument: "",
    isPrimary: false,
  });

  const [showNewAccountForm, setShowNewAccountForm] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      success("Configurações salvas!", "Suas alterações foram aplicadas");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MerchantNavbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">
              Gerencie as configurações da sua loja
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="store">Loja</TabsTrigger>
            <TabsTrigger value="shipping">Envio</TabsTrigger>
            <TabsTrigger value="banking">Conta Bancária</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">
                        E-mail de Notificações
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receba notificações importantes por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">SMS</Label>
                      <p className="text-sm text-gray-500">
                        Notificações por mensagem de texto
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, smsNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Novos Pedidos</Label>
                      <p className="text-sm text-gray-500">
                        Seja notificado sobre novos pedidos
                      </p>
                    </div>
                    <Switch
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          orderNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">
                        Alertas de Estoque Baixo
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receba alertas quando produtos estiverem com estoque
                        baixo
                      </p>
                    </div>
                    <Switch
                      checked={settings.lowStockAlerts}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, lowStockAlerts: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Novas Avaliações</Label>
                      <p className="text-sm text-gray-500">
                        Notificações sobre novas avaliações dos produtos
                      </p>
                    </div>
                    <Switch
                      checked={settings.reviewNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          reviewNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">E-mails de Marketing</Label>
                      <p className="text-sm text-gray-500">
                        Receba dicas, novidades e ofertas da WIN
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, marketingEmails: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store Tab */}
          <TabsContent value="store">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Configurações da Loja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Loja Aberta</Label>
                      <p className="text-sm text-gray-500">
                        Quando desabilitada, a loja ficará em modo manutenção
                      </p>
                    </div>
                    <Switch
                      checked={settings.storeOpen}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, storeOpen: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">
                        Aceitar Pedidos Automaticamente
                      </Label>
                      <p className="text-sm text-gray-500">
                        Pedidos serão aceitos automaticamente sem necessidade de
                        confirmação
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoAcceptOrders}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, autoAcceptOrders: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">
                        Mostrar Quantidade em Estoque
                      </Label>
                      <p className="text-sm text-gray-500">
                        Exibir quantidade disponível para os clientes
                      </p>
                    </div>
                    <Switch
                      checked={settings.showStock}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, showStock: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Permitir Avaliações</Label>
                      <p className="text-sm text-gray-500">
                        Clientes podem avaliar produtos e a loja
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowReviews}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, allowReviews: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">Chat com Clientes</Label>
                      <p className="text-sm text-gray-500">
                        Permitir chat direto com clientes interessados
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableChat}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, enableChat: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Configurações de Envio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeShipping">
                      Valor Mínimo para Frete Grátis (R$)
                    </Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      placeholder="100"
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-sm text-gray-500">
                      Deixe 0 para desabilitar frete grátis
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processingTime">
                      Tempo de Processamento
                    </Label>
                    <Select
                      value={settings.processingTime}
                      onValueChange={(value) =>
                        setSettings({ ...settings, processingTime: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same-day">Mesmo dia</SelectItem>
                        <SelectItem value="1-2">1-2 dias úteis</SelectItem>
                        <SelectItem value="3-5">3-5 dias úteis</SelectItem>
                        <SelectItem value="5-7">5-7 dias úteis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnPolicy">
                    Política de Devolução (dias)
                  </Label>
                  <Select
                    value={settings.returnPolicy.toString()}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        returnPolicy: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Não aceita devolução</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Prazo que o cliente tem para solicitar devolução
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Banknote className="h-5 w-5 mr-2" />
                    Contas Bancárias
                  </CardTitle>
                  <Button
                    onClick={() => setShowNewAccountForm(true)}
                    className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Bank Accounts */}
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 border rounded-lg ${
                        account.isPrimary
                          ? "border-[#3DBEAB] bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {account.bankName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Ag: {account.agency} | Conta: {account.account}{" "}
                                ({account.accountType})
                              </p>
                              <p className="text-sm text-gray-500">
                                {account.holderName} - {account.holderDocument}
                              </p>
                            </div>
                            {account.isPrimary && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-sm font-medium text-green-600">
                                  Principal
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!account.isPrimary && (
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New Account Form */}
                {showNewAccountForm && (
                  <Card className="border-[#3DBEAB]">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Adicionar Nova Conta Bancária
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Nome do Banco *</Label>
                          <Select
                            value={newAccount.bankName}
                            onValueChange={(value) =>
                              setNewAccount({ ...newAccount, bankName: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o banco" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Banco do Brasil">
                                Banco do Brasil (001)
                              </SelectItem>
                              <SelectItem value="Bradesco">
                                Bradesco (237)
                              </SelectItem>
                              <SelectItem value="Caixa Econômica Federal">
                                Caixa Econômica Federal (104)
                              </SelectItem>
                              <SelectItem value="Itaú">Itaú (341)</SelectItem>
                              <SelectItem value="Santander">
                                Santander (033)
                              </SelectItem>
                              <SelectItem value="Nubank">
                                Nubank (260)
                              </SelectItem>
                              <SelectItem value="Inter">Inter (077)</SelectItem>
                              <SelectItem value="Sicoob">
                                Sicoob (756)
                              </SelectItem>
                              <SelectItem value="Sicredi">
                                Sicredi (748)
                              </SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accountType">Tipo de Conta *</Label>
                          <Select
                            value={newAccount.accountType}
                            onValueChange={(value) =>
                              setNewAccount({
                                ...newAccount,
                                accountType: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corrente">
                                Conta Corrente
                              </SelectItem>
                              <SelectItem value="poupanca">
                                Conta Poupança
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agency">Agência *</Label>
                          <Input
                            id="agency"
                            placeholder="1234-5"
                            value={newAccount.agency}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                agency: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account">Número da Conta *</Label>
                          <Input
                            id="account"
                            placeholder="12345-6"
                            value={newAccount.account}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                account: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="holderName">Nome do Titular *</Label>
                          <Input
                            id="holderName"
                            placeholder="João Silva"
                            value={newAccount.holderName}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                holderName: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="holderDocument">
                            CPF/CNPJ do Titular *
                          </Label>
                          <Input
                            id="holderDocument"
                            placeholder="123.456.789-00"
                            value={newAccount.holderDocument}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                holderDocument: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPrimary"
                          checked={newAccount.isPrimary}
                          onChange={(e) =>
                            setNewAccount({
                              ...newAccount,
                              isPrimary: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-[#3DBEAB] border-gray-300 rounded focus:ring-[#3DBEAB]"
                        />
                        <Label htmlFor="isPrimary" className="text-sm">
                          Definir como conta principal para recebimentos
                        </Label>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          Informações Importantes:
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>
                            • Os dados bancários devem estar no nome da pessoa
                            física ou jurídica cadastrada
                          </li>
                          <li>
                            • A conta principal será usada para todos os
                            recebimentos
                          </li>
                          <li>
                            • Os recebimentos são processados em D+2 (2 dias
                            úteis)
                          </li>
                          <li>
                            • Verifique se todos os dados estão corretos antes
                            de salvar
                          </li>
                        </ul>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewAccountForm(false);
                            setNewAccount({
                              bankName: "",
                              bankCode: "",
                              agency: "",
                              account: "",
                              accountType: "corrente",
                              holderName: "",
                              holderDocument: "",
                              isPrimary: false,
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            // Add new account logic
                            const id = bankAccounts.length + 1;
                            setBankAccounts([
                              ...bankAccounts,
                              { ...newAccount, id },
                            ]);
                            setShowNewAccountForm(false);
                            setNewAccount({
                              bankName: "",
                              bankCode: "",
                              agency: "",
                              account: "",
                              accountType: "corrente",
                              holderName: "",
                              holderDocument: "",
                              isPrimary: false,
                            });
                            success(
                              "Conta bancária adicionada!",
                              "Os dados foram salvos com sucesso",
                            );
                          }}
                          className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
                        >
                          Adicionar Conta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">
                        Autenticação de Dois Fatores
                      </Label>
                      <p className="text-sm text-gray-500">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, twoFactorEnabled: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Timeout da Sessão (minutos)
                    </Label>
                    <Select
                      value={settings.sessionTimeout.toString()}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          sessionTimeout: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                        <SelectItem value="0">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Tempo de inatividade antes de fazer logout automático
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base">Alterar Senha</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Sua senha atual"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Nova senha"
                        />
                      </div>
                    </div>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-800">
                        Zona de Perigo
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Ações irreversíveis que afetam permanentemente sua
                        conta.
                      </p>
                      <div className="mt-4 space-y-2">
                        <Button variant="destructive" size="sm">
                          Desativar Conta Temporariamente
                        </Button>
                        <Button variant="destructive" size="sm">
                          Excluir Conta Permanentemente
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  SEO e Otimização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Título da Loja (Meta Title)</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Ex: Ferragens Premium - Materiais de Construção"
                    value={settings.metaTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, metaTitle: e.target.value })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Máximo 60 caracteres. Aparece no título da aba do navegador
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">
                    Descrição da Loja (Meta Description)
                  </Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Descreva sua loja em poucas palavras para aparecer nos resultados de busca..."
                    rows={3}
                    value={settings.metaDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        metaDescription: e.target.value,
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Máximo 160 caracteres. Aparece nos resultados de busca do
                    Google
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Palavras-chave</Label>
                  <Input
                    id="keywords"
                    placeholder="Ex: ferragens, parafusos, materiais construção, ferramentas"
                    value={settings.keywords}
                    onChange={(e) =>
                      setSettings({ ...settings, keywords: e.target.value })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Separe por vírgulas. Palavras relacionadas aos seus produtos
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Dicas para melhorar o SEO:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Use palavras-chave relevantes no título e descrição
                    </li>
                    <li>• Mantenha o título entre 50-60 caracteres</li>
                    <li>• Escreva descrições únicas e atrativas</li>
                    <li>• Atualize regularmente com novos produtos</li>
                    <li>• Use imagens de qualidade com texto alternativo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
