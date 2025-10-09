import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  UserCircleIcon,
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
  ComputerDesktopIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const AdminProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "Administrator",
    email: "admin@winmarketplace.com",
    phone: "(11) 99999-9999",
    avatar: "",
    role: "Super Admin",
    department: "Administração",
    lastLogin: "24/07/2024 14:30",
    createdAt: "15/01/2024",
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: true,
    sessionTimeout: 30,
    lastPasswordChange: "15/06/2024",
    loginAlerts: true,
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
    {
      id: 2,
      device: "Safari - MacOS",
      location: "São Paulo, SP",
      ip: "192.168.1.101",
      lastActive: "2 horas atrás",
      current: false,
    },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating profile:", profileData);
    // Here you would send the update to your backend
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }
    console.log("Changing password");
    // Here you would send the password change to your backend
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogoutSession = (sessionId: number) => {
    console.log("Logging out session:", sessionId);
    // Here you would invalidate the session
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Meu Perfil</h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e configurações de segurança
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
                  {profileData.name}
                </h3>
                <p className="text-sm text-gray-600">{profileData.role}</p>
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
                    Informações do Perfil
                  </h3>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
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
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={profileData.role}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        Salvar Alterações
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
                          {profileData.createdAt}
                        </p>
                        <p className="text-xs text-gray-600">Criada em</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-[#111827]">
                          {profileData.lastLogin}
                        </p>
                        <p className="text-xs text-gray-600">Último acesso</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-[#111827]">
                          {profileData.department}
                        </p>
                        <p className="text-xs text-gray-600">Departamento</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-green-600">
                          ●
                        </p>
                        <p className="text-xs text-gray-600">Status</p>
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
    </AdminLayout>
  );
};

export default AdminProfile;
