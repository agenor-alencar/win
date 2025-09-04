import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Cog6ToothIcon,
  CreditCardIcon,
  TruckIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      commissionRate: "7.0",
      deliveryFee: "8.50",
      freeShippingThreshold: "150.00",
      autoApprovalLimit: "500.00",
      maxDeliveryDistance: "15",
      orderTimeout: "30",
    },
    payments: {
      pixKey: "pix@winmarketplace.com",
      pixKeyType: "email",
      paymentGateway: "stripe",
      stripePublicKey: "pk_test_xxxxxxxxxxxxx",
      stripeSecretKey: "sk_test_xxxxxxxxxxxxx",
      mercadoPagoAccessToken: "APP_USR_xxxxxxxxxxxxx",
      autoCapture: true,
      refundPolicy: "automatic",
    },
    delivery: {
      baseDeliveryFee: "8.50",
      deliveryFeePerKm: "1.20",
      maxDeliveryTime: "60",
      driverCommission: "75",
      autoAssignDelivery: true,
      allowScheduledDelivery: true,
      workingHours: {
        start: "08:00",
        end: "22:00",
      },
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderConfirmation: true,
      statusUpdates: true,
      promotionalEmails: false,
      weeklyReports: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: "120",
      maxLoginAttempts: "5",
      passwordStrength: "medium",
      ipWhitelist: "",
      auditLog: true,
    },
    legal: {
      termsVersion: "1.2",
      privacyVersion: "1.1",
      cookiePolicy: true,
      gdprCompliance: true,
      dataRetention: "5",
      contactEmail: "suporte@winmarketplace.com",
    },
  });

  const tabs = [
    { id: "general", name: "Geral", icon: Cog6ToothIcon },
    { id: "payments", name: "Pagamentos", icon: CreditCardIcon },
    { id: "delivery", name: "Entregas", icon: TruckIcon },
    { id: "notifications", name: "Notificações", icon: MegaphoneIcon },
    { id: "security", name: "Segurança", icon: ShieldCheckIcon },
    { id: "legal", name: "Legal", icon: DocumentTextIcon },
  ];

  const updateSetting = (tab: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const saveSettings = () => {
    console.log("Saving settings:", settings);
    // Implement save functionality
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Configurações do Sistema
            </h1>
            <p className="text-gray-600">
              Configure parâmetros e integrações do marketplace
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Restaurar Padrões</span>
            </button>
            <button
              onClick={saveSettings}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações Gerais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa de Comissão Padrão (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.general.commissionRate}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "commissionRate",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa de Entrega Padrão (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.general.deliveryFee}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "deliveryFee",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frete Grátis a partir de (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.general.freeShippingThreshold}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "freeShippingThreshold",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limite Aprovação Automática (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.general.autoApprovalLimit}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "autoApprovalLimit",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distância Máxima Entrega (km)
                      </label>
                      <input
                        type="number"
                        value={settings.general.maxDeliveryDistance}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "maxDeliveryDistance",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeout de Pedido (min)
                      </label>
                      <input
                        type="number"
                        value={settings.general.orderTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "general",
                            "orderTimeout",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payments" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Pagamento
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Chave PIX
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo da Chave
                          </label>
                          <select
                            value={settings.payments.pixKeyType}
                            onChange={(e) =>
                              updateSetting(
                                "payments",
                                "pixKeyType",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          >
                            <option value="email">E-mail</option>
                            <option value="phone">Telefone</option>
                            <option value="cpf">CPF</option>
                            <option value="random">Chave Aleatória</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chave PIX
                          </label>
                          <input
                            type="text"
                            value={settings.payments.pixKey}
                            onChange={(e) =>
                              updateSetting(
                                "payments",
                                "pixKey",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Gateway de Pagamento
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provedor Principal
                          </label>
                          <select
                            value={settings.payments.paymentGateway}
                            onChange={(e) =>
                              updateSetting(
                                "payments",
                                "paymentGateway",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          >
                            <option value="stripe">Stripe</option>
                            <option value="mercadopago">Mercado Pago</option>
                            <option value="pagseguro">PagSeguro</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stripe Public Key
                            </label>
                            <input
                              type="text"
                              value={settings.payments.stripePublicKey}
                              onChange={(e) =>
                                updateSetting(
                                  "payments",
                                  "stripePublicKey",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stripe Secret Key
                            </label>
                            <input
                              type="password"
                              value={settings.payments.stripeSecretKey}
                              onChange={(e) =>
                                updateSetting(
                                  "payments",
                                  "stripeSecretKey",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.payments.autoCapture}
                          onChange={(e) =>
                            updateSetting(
                              "payments",
                              "autoCapture",
                              e.target.checked,
                            )
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Captura automática de pagamentos
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Settings */}
              {activeTab === "delivery" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Entrega
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa Base de Entrega (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.delivery.baseDeliveryFee}
                        onChange={(e) =>
                          updateSetting(
                            "delivery",
                            "baseDeliveryFee",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa por KM (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.delivery.deliveryFeePerKm}
                        onChange={(e) =>
                          updateSetting(
                            "delivery",
                            "deliveryFeePerKm",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tempo Máximo Entrega (min)
                      </label>
                      <input
                        type="number"
                        value={settings.delivery.maxDeliveryTime}
                        onChange={(e) =>
                          updateSetting(
                            "delivery",
                            "maxDeliveryTime",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comissão Motorista (%)
                      </label>
                      <input
                        type="number"
                        value={settings.delivery.driverCommission}
                        onChange={(e) =>
                          updateSetting(
                            "delivery",
                            "driverCommission",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Horário de Funcionamento
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Início
                        </label>
                        <input
                          type="time"
                          value={settings.delivery.workingHours.start}
                          onChange={(e) =>
                            updateSetting("delivery", "workingHours", {
                              ...settings.delivery.workingHours,
                              start: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fim
                        </label>
                        <input
                          type="time"
                          value={settings.delivery.workingHours.end}
                          onChange={(e) =>
                            updateSetting("delivery", "workingHours", {
                              ...settings.delivery.workingHours,
                              end: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.delivery.autoAssignDelivery}
                        onChange={(e) =>
                          updateSetting(
                            "delivery",
                            "autoAssignDelivery",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Atribuição automática de entregas
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.delivery.allowScheduledDelivery}
                        onChange={(e) =>
                          updateSetting(
                            "delivery",
                            "allowScheduledDelivery",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Permitir agendamento de entregas
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Notificações
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Canais de Notificação
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "emailNotifications",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Notificações por e-mail
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.smsNotifications}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "smsNotifications",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Notificações por SMS
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.pushNotifications}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "pushNotifications",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Notificações push
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Tipos de Notificação
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.orderConfirmation}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "orderConfirmation",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Confirmação de pedidos
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.statusUpdates}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "statusUpdates",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Atualizações de status
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.promotionalEmails}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "promotionalEmails",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            E-mails promocionais
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) =>
                              updateSetting(
                                "notifications",
                                "weeklyReports",
                                e.target.checked,
                              )
                            }
                            className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Relatórios semanais
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Segurança
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeout de Sessão (min)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "sessionTimeout",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Máx. Tentativas de Login
                      </label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "maxLoginAttempts",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Força da Senha
                      </label>
                      <select
                        value={settings.security.passwordStrength}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "passwordStrength",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IPs Permitidos (whitelist)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.security.ipWhitelist}
                      onChange={(e) =>
                        updateSetting("security", "ipWhitelist", e.target.value)
                      }
                      placeholder="192.168.1.1, 10.0.0.1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "twoFactorAuth",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Autenticação de dois fatores obrigatória
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.auditLog}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "auditLog",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Log de auditoria ativo
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Legal Settings */}
              {activeTab === "legal" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações Legais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versão dos Termos
                      </label>
                      <input
                        type="text"
                        value={settings.legal.termsVersion}
                        onChange={(e) =>
                          updateSetting("legal", "termsVersion", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versão da Privacidade
                      </label>
                      <input
                        type="text"
                        value={settings.legal.privacyVersion}
                        onChange={(e) =>
                          updateSetting(
                            "legal",
                            "privacyVersion",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retenção de Dados (anos)
                      </label>
                      <input
                        type="number"
                        value={settings.legal.dataRetention}
                        onChange={(e) =>
                          updateSetting(
                            "legal",
                            "dataRetention",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail de Contato
                      </label>
                      <input
                        type="email"
                        value={settings.legal.contactEmail}
                        onChange={(e) =>
                          updateSetting("legal", "contactEmail", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.legal.cookiePolicy}
                        onChange={(e) =>
                          updateSetting(
                            "legal",
                            "cookiePolicy",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Política de cookies ativa
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.legal.gdprCompliance}
                        onChange={(e) =>
                          updateSetting(
                            "legal",
                            "gdprCompliance",
                            e.target.checked,
                          )
                        }
                        className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Conformidade LGPD/GDPR
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
