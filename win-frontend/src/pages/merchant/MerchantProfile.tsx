import React, { useState, useEffect } from "react";
import { MerchantLayout } from "../../components/MerchantLayout";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  BellIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "../../contexts/NotificationContext";
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
  email: string;
  site: string;
  inscricaoEstadual: string;
  logoUrl: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  status: string;
  statusAprovacao: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

const MerchantProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lojista, setLojista] = useState<Lojista | null>(null);
  const { success, error: showError } = useNotification();

  const [profileData, setProfileData] = useState({
    storeName: "",
    legalName: "",
    description: "",
    cnpj: "",
    inscricaoEstadual: "",
    phone: "",
    email: "",
    site: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    lastPasswordChange: "",
    loginAlerts: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailOrders: true,
    emailReviews: true,
    emailMessages: true,
    emailPromotions: false,
    pushOrders: true,
    pushReviews: true,
    pushMessages: true,
  });

  const [scheduleData, setScheduleData] = useState({
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "09:00", close: "13:00", closed: false },
    sunday: { open: "09:00", close: "18:00", closed: true },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    {
      id: "profile",
      name: "Perfil",
      icon: UserCircleIcon,
    },
    {
      id: "notifications",
      name: "Notificações",
      icon: BellIcon,
    },
    {
      id: "schedule",
      name: "Horários",
      icon: ClockIcon,
    },
    {
      id: "security",
      name: "Segurança",
      icon: ShieldCheckIcon,
    },
    {
      id: "sessions",
      name: "Sessões",
      icon: ComputerDesktopIcon,
    },
  ];

  const activeSessions = [
    {
      id: 1,
      device: "Chrome - Windows 10",
      location: "São Paulo, SP",
      ip: "192.168.1.100",
      lastActive: "Agora",
      current: true,
    },
  ];

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

      // Atualizar formulário com dados reais do backend
      setProfileData({
        storeName: data.nomeFantasia || "",
        legalName: data.razaoSocial || "",
        description: data.descricao || "",
        cnpj: data.cnpj || "",
        inscricaoEstadual: data.inscricaoEstadual || "",
        phone: data.telefone || "",
        email: data.email || data.usuarioEmail || "",
        site: data.site || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        uf: data.uf || "",
        cep: data.cep || "",
      });
    } catch (err: any) {
      console.error("Erro ao buscar dados do lojista:", err);
      showError(
        "Erro ao carregar perfil",
        err.response?.data?.message ||
          "Não foi possível carregar os dados da loja"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lojista) return;

    try {
      setSaving(true);
      
      await api.put(`/api/v1/lojistas/${lojista.id}`, {
        usuarioId: lojista.usuarioId,
        cnpj: profileData.cnpj,
        nomeFantasia: profileData.storeName,
        razaoSocial: profileData.legalName,
        descricao: profileData.description,
        telefone: profileData.phone,
        email: profileData.email,
        site: profileData.site,
        inscricaoEstadual: profileData.inscricaoEstadual,
        logoUrl: lojista.logoUrl,
        logradouro: profileData.logradouro,
        numero: profileData.numero,
        complemento: profileData.complemento,
        bairro: profileData.bairro,
        cidade: profileData.cidade,
        uf: profileData.uf,
        cep: profileData.cep,
        ativo: lojista.ativo,
      });

      success("Perfil atualizado!", "Suas informações foram salvas com sucesso");
      await fetchLojistaData();
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      showError(
        "Erro ao salvar",
        err.response?.data?.message || "Não foi possível atualizar o perfil"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError("Senhas não coincidem", "As senhas devem ser iguais");
      return;
    }
    console.log("Changing password");
    // TODO: Integrar com endpoint de mudança de senha
    success("Senha alterada!", "Sua senha foi atualizada com sucesso");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleNotificationUpdate = () => {
    console.log("Updating notifications:", notificationSettings);
    // TODO: Integrar com endpoint de notificações
    success("Notificações atualizadas!", "Suas preferências foram salvas");
  };

  const handleScheduleUpdate = () => {
    console.log("Updating schedule:", scheduleData);
    // TODO: Integrar com endpoint de horários
    success("Horários atualizados!", "Seus horários de funcionamento foram salvos");
  };

  const handleLogoutSession = (sessionId: number) => {
    console.log("Logging out session:", sessionId);
    success("Sessão encerrada", "A sessão foi encerrada com sucesso");
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DBEAB]"></div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Meu Perfil</h1>
          <p className="text-gray-600">
            Gerencie as informações da sua loja e configurações de segurança
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCircleIcon className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-semibold text-[#111827]">
                  {profileData.storeName || "Minha Loja"}
                </h3>
                <p className="text-sm text-gray-600">Lojista</p>
              </div>

              <nav className="space-y-1">
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
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Informações da Loja
                  </h3>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Fantasia
                        </label>
                        <input
                          type="text"
                          value={profileData.storeName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              storeName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Razão Social
                        </label>
                        <input
                          type="text"
                          value={profileData.legalName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              legalName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={profileData.cnpj}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Inscrição Estadual
                        </label>
                        <input
                          type="text"
                          value={profileData.inscricaoEstadual}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              inscricaoEstadual: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Site
                        </label>
                        <input
                          type="url"
                          value={profileData.site}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              site: e.target.value,
                            })
                          }
                          placeholder="https://www.minhaloja.com.br"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição da Loja
                        </label>
                        <textarea
                          value={profileData.description}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CEP
                          </label>
                          <input
                            type="text"
                            value={profileData.cep}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                cep: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logradouro
                          </label>
                          <input
                            type="text"
                            value={profileData.logradouro}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                logradouro: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número
                          </label>
                          <input
                            type="text"
                            value={profileData.numero}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                numero: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={profileData.complemento}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                complemento: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={profileData.bairro}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                bairro: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={profileData.cidade}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                cidade: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UF
                          </label>
                          <input
                            type="text"
                            value={profileData.uf}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                uf: e.target.value,
                              })
                            }
                            maxLength={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                      >
                        {saving ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </div>
                  </form>

                  {/* Stats */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Informações da Conta
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-[#111827]">
                          {lojista?.criadoEm
                            ? new Date(lojista.criadoEm).toLocaleDateString(
                                "pt-BR"
                              )
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">Criada em</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-[#111827]">
                          {lojista?.atualizadoEm
                            ? new Date(lojista.atualizadoEm).toLocaleDateString(
                                "pt-BR"
                              )
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Última atualização
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-[#111827]">
                          {lojista?.statusAprovacao || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">Status</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p
                          className={`text-lg font-semibold ${lojista?.ativo ? "text-green-600" : "text-red-600"}`}
                        >
                          ●
                        </p>
                        <p className="text-xs text-gray-600">
                          {lojista?.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Segurança
                  </h3>

                  {/* Change Password */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Alterar Senha
                    </h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        Alterar Senha
                      </button>
                    </form>
                  </div>

                  {/* Security Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Configurações
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Autenticação de Dois Fatores
                          </p>
                          <p className="text-sm text-gray-600">
                            Adicione uma camada extra de segurança
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityData.twoFactorEnabled}
                            onChange={(e) =>
                              setSecurityData({
                                ...securityData,
                                twoFactorEnabled: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Alertas de Login
                          </p>
                          <p className="text-sm text-gray-600">
                            Receba alertas de novos logins
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityData.loginAlerts}
                            onChange={(e) =>
                              setSecurityData({
                                ...securityData,
                                loginAlerts: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div>
                        <p className="font-medium text-gray-900 mb-2">
                          Timeout de Sessão
                        </p>
                        <select
                          value={securityData.sessionTimeout}
                          onChange={(e) =>
                            setSecurityData({
                              ...securityData,
                              sessionTimeout: parseInt(e.target.value),
                            })
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        >
                          <option value={15}>15 minutos</option>
                          <option value={30}>30 minutos</option>
                          <option value={60}>1 hora</option>
                          <option value={120}>2 horas</option>
                          <option value={240}>4 horas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Preferências de Notificações
                  </h3>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Notificações por E-mail
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Novos Pedidos</p>
                          <p className="text-sm text-gray-600">
                            Receba e-mails quando houver novos pedidos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailOrders}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailOrders: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Avaliações</p>
                          <p className="text-sm text-gray-600">
                            Notificações de novas avaliações de produtos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailReviews}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailReviews: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Mensagens</p>
                          <p className="text-sm text-gray-600">
                            E-mails sobre mensagens de clientes
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailMessages}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailMessages: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Promoções</p>
                          <p className="text-sm text-gray-600">
                            Novidades e dicas sobre a plataforma
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailPromotions}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailPromotions: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Notificações Push
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Novos Pedidos</p>
                          <p className="text-sm text-gray-600">
                            Notificações instantâneas de novos pedidos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushOrders}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                pushOrders: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Avaliações</p>
                          <p className="text-sm text-gray-600">
                            Alertas de novas avaliações
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushReviews}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                pushReviews: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Mensagens</p>
                          <p className="text-sm text-gray-600">
                            Alertas instantâneos de mensagens
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushMessages}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                pushMessages: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleNotificationUpdate}
                      className="px-6 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Salvar Preferências
                    </button>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Horários de Funcionamento
                  </h3>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-4">
                      {Object.entries(scheduleData).map(([day, schedule]) => {
                        const dayNames: Record<string, string> = {
                          monday: "Segunda-feira",
                          tuesday: "Terça-feira",
                          wednesday: "Quarta-feira",
                          thursday: "Quinta-feira",
                          friday: "Sexta-feira",
                          saturday: "Sábado",
                          sunday: "Domingo",
                        };

                        return (
                          <div
                            key={day}
                            className="flex items-center space-x-4 pb-4 border-b last:border-b-0"
                          >
                            <div className="w-32">
                              <p className="font-medium text-gray-900">
                                {dayNames[day]}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="time"
                                value={schedule.open}
                                disabled={schedule.closed}
                                onChange={(e) =>
                                  setScheduleData({
                                    ...scheduleData,
                                    [day]: {
                                      ...schedule,
                                      open: e.target.value,
                                    },
                                  })
                                }
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                              />
                              <span className="text-gray-500">até</span>
                              <input
                                type="time"
                                value={schedule.close}
                                disabled={schedule.closed}
                                onChange={(e) =>
                                  setScheduleData({
                                    ...scheduleData,
                                    [day]: {
                                      ...schedule,
                                      close: e.target.value,
                                    },
                                  })
                                }
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                              />
                            </div>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={schedule.closed}
                                onChange={(e) =>
                                  setScheduleData({
                                    ...scheduleData,
                                    [day]: {
                                      ...schedule,
                                      closed: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 text-[#3DBEAB] border-gray-300 rounded focus:ring-[#3DBEAB]"
                              />
                              <span className="text-sm text-gray-600">
                                Fechado
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Dica:</strong> Os horários de funcionamento são
                      exibidos para os clientes na página da sua loja.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleScheduleUpdate}
                      className="px-6 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Salvar Horários
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Segurança
                  </h3>

                  {/* Change Password */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Alterar Senha
                    </h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
                        >
                          Alterar Senha
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Configurações de Segurança
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium text-gray-900">
                            Autenticação de Dois Fatores
                          </p>
                          <p className="text-sm text-gray-600">
                            Adicione uma camada extra de segurança
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityData.twoFactorEnabled}
                            onChange={(e) =>
                              setSecurityData({
                                ...securityData,
                                twoFactorEnabled: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            Alertas de Login
                          </p>
                          <p className="text-sm text-gray-600">
                            Receba notificações de novos acessos
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={securityData.loginAlerts}
                            onChange={(e) =>
                              setSecurityData({
                                ...securityData,
                                loginAlerts: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3DBEAB]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === "sessions" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Sessões Ativas
                  </h3>

                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <ComputerDesktopIcon className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {session.device}
                                {session.current && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Atual
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {session.location} • IP: {session.ip}
                              </p>
                              <p className="text-xs text-gray-500">
                                Última atividade: {session.lastActive}
                              </p>
                            </div>
                          </div>
                          {!session.current && (
                            <button
                              onClick={() => handleLogoutSession(session.id)}
                              className="px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Encerrar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Dica de Segurança:</strong> Revise regularmente
                      suas sessões ativas e encerre qualquer sessão que você não
                      reconheça.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantProfile;
