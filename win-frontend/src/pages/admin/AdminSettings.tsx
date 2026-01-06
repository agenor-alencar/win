import { useState, useEffect } from "react";
import {
  Settings,
  Truck,
  Bell,
  Shield,
  FileText,
  BanknoteIcon,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNotification } from "@/contexts/NotificationContext";

interface SystemSettings {
  // Financial Model
  taxaComissaoWin: number;
  taxaRepasseLojista: number;
  valorEntregaMotorista: number;
  taxaProcessamentoPagamento: number;
  diasRepasse: number;

  // General
  taxaEntregaPadrao: number;
  freteGratisAcimaDe: number;
  limiteAprovacaoAutomatica: number;
  distanciaMaximaEntregaKm: number;
  timeoutPedidoMinutos: number;

  // Delivery
  tempoPreparacaoMinimo: number;
  tempoPreparacaoMaximo: number;
  raioMaximoEntregaKm: number;
  timeoutBuscaMotoristaMicro: number;
  atribuirMotoristaAutomaticamente: boolean;

  // Notifications
  notificacoesPedidosEmail: boolean;
  notificacoesPedidosSMS: boolean;
  notificacoesPedidosPush: boolean;
  notificacoesEntregasEmail: boolean;
  notificacoesEntregasSMS: boolean;
  notificacoesEntregasPush: boolean;
  notificacoesPromocoes: boolean;
  notificacoesNewsletters: boolean;

  // Security
  requisitarAutenticacaoDuploFator: boolean;
  duracaoSessaoMinutos: number;
  tentativasLoginMaximas: number;
  bloqueioTemporarioMinutos: number;
  requisitarSenhaForte: boolean;

  // Legal
  termosUsoVersao: string;
  politicaPrivacidadeVersao: string;
  politicaCookiesVersao: string;
  requisitarAceiteTermos: boolean;
  lgpdAtivo: boolean;
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<
    "financial" | "general" | "delivery" | "notifications" | "security" | "legal"
  >("financial");

  const [settings, setSettings] = useState<SystemSettings>({
    // Financial Model - Default values
    taxaComissaoWin: 7.0,
    taxaRepasseLojista: 93.0,
    valorEntregaMotorista: 15.0,
    taxaProcessamentoPagamento: 2.5,
    diasRepasse: 2,

    // General
    taxaEntregaPadrao: 10.0,
    freteGratisAcimaDe: 100.0,
    limiteAprovacaoAutomatica: 500.0,
    distanciaMaximaEntregaKm: 30,
    timeoutPedidoMinutos: 30,

    // Delivery
    tempoPreparacaoMinimo: 10,
    tempoPreparacaoMaximo: 60,
    raioMaximoEntregaKm: 20.0,
    timeoutBuscaMotoristaMicro: 5,
    atribuirMotoristaAutomaticamente: true,

    // Notifications
    notificacoesPedidosEmail: true,
    notificacoesPedidosSMS: false,
    notificacoesPedidosPush: true,
    notificacoesEntregasEmail: true,
    notificacoesEntregasSMS: false,
    notificacoesEntregasPush: true,
    notificacoesPromocoes: true,
    notificacoesNewsletters: false,

    // Security
    requisitarAutenticacaoDuploFator: false,
    duracaoSessaoMinutos: 480,
    tentativasLoginMaximas: 5,
    bloqueioTemporarioMinutos: 30,
    requisitarSenhaForte: true,

    // Legal
    termosUsoVersao: "1.0",
    politicaPrivacidadeVersao: "1.0",
    politicaCookiesVersao: "1.0",
    requisitarAceiteTermos: true,
    lgpdAtivo: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/admin/configuracoes",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao carregar configurações");

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      showNotification("Erro ao carregar configurações", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        "http://localhost:8080/admin/configuracoes",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar configurações");

      showNotification("Configurações salvas com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      showNotification("Erro ao salvar configurações", "error");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    if (!confirm("Tem certeza que deseja restaurar as configurações padrão?"))
      return;

    setSaving(true);
    try {
      const response = await fetch(
        "http://localhost:8080/admin/configuracoes/restaurar-padrao",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao restaurar configurações");

      const data = await response.json();
      setSettings(data);
      showNotification("Configurações restauradas com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao restaurar configurações:", error);
      showNotification("Erro ao restaurar configurações", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "financial", label: "Modelo Financeiro", icon: BanknoteIcon },
    { id: "general", label: "Geral", icon: Settings },
    { id: "delivery", label: "Entregas", icon: Truck },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "legal", label: "Legal", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as configurações gerais do sistema
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restoreDefaults}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Restaurar Padrão
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-[#3DBEAB] text-white rounded-lg hover:bg-[#35A897] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "financial"
                        | "general"
                        | "delivery"
                        | "notifications"
                        | "security"
                        | "legal"
                    )
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#3DBEAB] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            
            {/* Financial Model Settings */}
            {activeTab === "financial" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Modelo Financeiro
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure as taxas e regras financeiras do marketplace
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Atenção:</strong> A soma da comissão WIN e repasse ao lojista deve ser sempre 100%
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Comissão WIN (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.taxaComissaoWin}
                      onChange={(e) => {
                        const comissao = parseFloat(e.target.value);
                        updateSetting("taxaComissaoWin", comissao);
                        updateSetting("taxaRepasseLojista", 100 - comissao);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentual de comissão da plataforma sobre cada venda
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Repasse ao Lojista (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxaRepasseLojista}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Calculado automaticamente (100% - Comissão WIN)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Médio por Entrega - Motorista (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.valorEntregaMotorista}
                      onChange={(e) =>
                        updateSetting("valorEntregaMotorista", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor pago ao motorista por entrega realizada
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Processamento de Pagamento (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={settings.taxaProcessamentoPagamento}
                      onChange={(e) =>
                        updateSetting("taxaProcessamentoPagamento", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Taxa adicional para processamento de pagamentos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prazo de Repasse ao Lojista (dias)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={settings.diasRepasse}
                      onChange={(e) =>
                        updateSetting("diasRepasse", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Dias úteis após entrega confirmada (D+N)
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Exemplo de Cálculo - Pedido de R$ 100,00
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor do Pedido:</span>
                      <span className="font-medium">R$ 100,00</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Comissão WIN ({settings.taxaComissaoWin}%):</span>
                      <span className="font-medium">R$ {(100 * settings.taxaComissaoWin / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Repasse Lojista ({settings.taxaRepasseLojista}%):</span>
                      <span className="font-medium">R$ {(100 * settings.taxaRepasseLojista / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Pagamento Motorista:</span>
                      <span className="font-medium">R$ {settings.valorEntregaMotorista.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span>Prazo de Repasse:</span>
                      <span className="font-medium">D+{settings.diasRepasse}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#111827]">
                  Configurações Gerais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Entrega Padrão (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxaEntregaPadrao}
                      onChange={(e) =>
                        updateSetting("taxaEntregaPadrao", parseFloat(e.target.value))
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
                      value={settings.freteGratisAcimaDe}
                      onChange={(e) =>
                        updateSetting("freteGratisAcimaDe", parseFloat(e.target.value))
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
                      value={settings.limiteAprovacaoAutomatica}
                      onChange={(e) =>
                        updateSetting("limiteAprovacaoAutomatica", parseFloat(e.target.value))
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
                      value={settings.distanciaMaximaEntregaKm}
                      onChange={(e) =>
                        updateSetting("distanciaMaximaEntregaKm", parseInt(e.target.value))
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
                      value={settings.timeoutPedidoMinutos}
                      onChange={(e) =>
                        updateSetting("timeoutPedidoMinutos", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Settings */}
            {activeTab === "delivery" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#111827]">
                    Configurações de Entrega
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure os parâmetros de entrega Uber Flash e regras de motorista
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    <strong>Uber Flash:</strong> As entregas são gerenciadas automaticamente pelo sistema da Uber
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de Preparação Mínimo (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={settings.tempoPreparacaoMinimo}
                      onChange={(e) =>
                        updateSetting("tempoPreparacaoMinimo", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo mínimo para o lojista preparar o pedido
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de Preparação Máximo (min)
                    </label>
                    <input
                      type="number"
                      max="180"
                      value={settings.tempoPreparacaoMaximo}
                      onChange={(e) =>
                        updateSetting("tempoPreparacaoMaximo", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo máximo permitido para preparação
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raio Máximo de Entrega (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.raioMaximoEntregaKm}
                      onChange={(e) =>
                        updateSetting("raioMaximoEntregaKm", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Distância máxima aceita para entregas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout Busca Motorista (min)
                    </label>
                    <input
                      type="number"
                      value={settings.timeoutBuscaMotoristaMicro}
                      onChange={(e) =>
                        updateSetting("timeoutBuscaMotoristaMicro", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo máximo para encontrar motorista via Uber Flash
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="atribuirMotoristaAutomaticamente"
                        checked={settings.atribuirMotoristaAutomaticamente}
                        onChange={(e) =>
                          updateSetting("atribuirMotoristaAutomaticamente", e.target.checked)
                        }
                        className="h-4 w-4 text-[#3DBEAB] focus:ring-[#3DBEAB] border-gray-300 rounded"
                      />
                      <label
                        htmlFor="atribuirMotoristaAutomaticamente"
                        className="text-sm text-gray-700"
                      >
                        Solicitar motorista Uber Flash automaticamente após aprovação do pedido
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#111827]">
                  Configurações de Notificações
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Notificações de Pedidos
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificacoesPedidosEmail}
                          onChange={(e) =>
                            updateSetting("notificacoesPedidosEmail", e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Notificações por E-mail
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificacoesPedidosSMS}
                          onChange={(e) =>
                            updateSetting("notificacoesPedidosSMS", e.target.checked)
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
                          checked={settings.notificacoesPedidosPush}
                          onChange={(e) =>
                            updateSetting("notificacoesPedidosPush", e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Notificações Push
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Notificações de Entregas
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificacoesEntregasEmail}
                          onChange={(e) =>
                            updateSetting("notificacoesEntregasEmail", e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Notificações por E-mail
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificacoesEntregasSMS}
                          onChange={(e) =>
                            updateSetting("notificacoesEntregasSMS", e.target.checked)
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
                          checked={settings.notificacoesEntregasPush}
                          onChange={(e) =>
                            updateSetting("notificacoesEntregasPush", e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Notificações Push
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Marketing
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificacoesPromocoes}
                          onChange={(e) =>
                            updateSetting("notificacoesPromocoes", e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Promoções e Ofertas
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.notificacoesNewsletters}
                          onChange={(e) =>
                            updateSetting("notificacoesNewsletters", e.target.checked)
                          }
                          className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Newsletters
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

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requisitarAutenticacaoDuploFator}
                      onChange={(e) =>
                        updateSetting("requisitarAutenticacaoDuploFator", e.target.checked)
                      }
                      className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requisitar autenticação de dois fatores (2FA)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requisitarSenhaForte}
                      onChange={(e) =>
                        updateSetting("requisitarSenhaForte", e.target.checked)
                      }
                      className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requisitar senhas fortes (mínimo 8 caracteres, letras, números e símbolos)
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração da Sessão (minutos)
                    </label>
                    <input
                      type="number"
                      value={settings.duracaoSessaoMinutos}
                      onChange={(e) =>
                        updateSetting("duracaoSessaoMinutos", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentativas de Login Máximas
                    </label>
                    <input
                      type="number"
                      value={settings.tentativasLoginMaximas}
                      onChange={(e) =>
                        updateSetting("tentativasLoginMaximas", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bloqueio Temporário (minutos)
                    </label>
                    <input
                      type="number"
                      value={settings.bloqueioTemporarioMinutos}
                      onChange={(e) =>
                        updateSetting("bloqueioTemporarioMinutos", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo de bloqueio após exceder tentativas de login
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Settings */}
            {activeTab === "legal" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#111827]">
                  Configurações Legais e Compliance
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.requisitarAceiteTermos}
                      onChange={(e) =>
                        updateSetting("requisitarAceiteTermos", e.target.checked)
                      }
                      className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Requisitar aceite dos termos de uso no cadastro
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.lgpdAtivo}
                      onChange={(e) =>
                        updateSetting("lgpdAtivo", e.target.checked)
                      }
                      className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      LGPD Ativo - Conformidade com Lei Geral de Proteção de Dados
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Versão Termos de Uso
                    </label>
                    <input
                      type="text"
                      value={settings.termosUsoVersao}
                      onChange={(e) =>
                        updateSetting("termosUsoVersao", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Versão Política de Privacidade
                    </label>
                    <input
                      type="text"
                      value={settings.politicaPrivacidadeVersao}
                      onChange={(e) =>
                        updateSetting("politicaPrivacidadeVersao", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Versão Política de Cookies
                    </label>
                    <input
                      type="text"
                      value={settings.politicaCookiesVersao}
                      onChange={(e) =>
                        updateSetting("politicaCookiesVersao", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
