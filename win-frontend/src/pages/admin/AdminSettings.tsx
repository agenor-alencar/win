import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Settings,
  Truck,
  Bell,
  Shield,
  FileText,
  BanknoteIcon,
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { settingsApi, SystemSettings } from "@/lib/admin/SettingsApi";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useNotification();
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
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      showError("Erro ao carregar configurações");
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
      await settingsApi.updateSettings(settings);
      success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      showError("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    if (!confirm("Tem certeza que deseja restaurar as configurações padrão?"))
      return;

    setSaving(true);
    try {
      const data = await settingsApi.restoreDefaults();
      setSettings(data);
      success("Configurações restauradas com sucesso!");
    } catch (error) {
      console.error("Erro ao restaurar configurações:", error);
      showError("Erro ao restaurar configurações");
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
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DBEAB]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
                  <h3 className="text-lg font-semibold text-[#111827] flex items-center gap-2">
                    <BanknoteIcon className="w-6 h-6 text-[#3DBEAB]" />
                    Modelo Financeiro
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure as taxas e regras financeiras do marketplace. Estas configurações afetam diretamente o split de pagamento com o Pagar.me.
                  </p>
                </div>

                {/* Alerta Importante */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-1">Como funciona o Split de Pagamento</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• A comissão WIN + repasse ao lojista deve sempre somar <strong>100%</strong></li>
                        <li>• O <strong>lojista recebe</strong> sua porcentagem sobre o valor dos produtos</li>
                        <li>• O <strong>marketplace recebe</strong> a comissão + 100% do valor do frete</li>
                        <li>• No Pagar.me, o split é processado automaticamente ao aprovar o pagamento</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="taxa-comissao-win" className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Comissão WIN (%)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="taxa-comissao-win"
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
                      💰 Percentual que o marketplace retém sobre o <strong>valor dos produtos</strong> vendidos
                    </p>
                  </div>

                  <div>
                    <label htmlFor="taxa-repasse-lojista" className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Repasse ao Lojista (%)
                      <span className="text-gray-400 ml-1">(automático)</span>
                    </label>
                    <input
                      id="taxa-repasse-lojista"
                      type="number"
                      step="0.01"
                      value={settings.taxaRepasseLojista}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      🏪 Calculado automaticamente: <strong>100% - Comissão WIN</strong>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="valor-entrega-motorista" className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Médio por Entrega - Motorista (R$)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="valor-entrega-motorista"
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
                      🚚 Valor fixo pago ao motorista por entrega realizada via <strong>Uber Flash</strong>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="taxa-processamento" className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Processamento de Pagamento (%)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="taxa-processamento"
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
                      💳 Taxa adicional cobrada pelos gateways de pagamento (Pagar.me, etc)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="dias-repasse" className="block text-sm font-medium text-gray-700 mb-2">
                      Prazo de Repasse ao Lojista (dias)
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="dias-repasse"
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
                      📅 Dias úteis após entrega confirmada para repasse ao lojista (<strong>D+N</strong>)
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <BanknoteIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="text-base font-semibold text-gray-900">
                      Simulador de Split - Pedido de R$ 100,00
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Valor Total */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <span className="text-gray-700 font-medium">💰 Valor Total do Pedido</span>
                      <span className="font-bold text-lg">R$ 100,00</span>
                    </div>

                    {/* Divisor */}
                    <div className="flex items-center gap-2 px-3">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="text-xs text-gray-500 font-medium">SPLIT DE PAGAMENTO</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Comissão Marketplace */}
                    <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg border border-blue-300">
                      <div className="flex flex-col">
                        <span className="text-blue-800 font-medium">🏢 Comissão WIN Marketplace</span>
                        <span className="text-xs text-blue-600">Receita da plataforma sobre produtos</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-700">R$ {(100 * settings.taxaComissaoWin / 100).toFixed(2)}</div>
                        <div className="text-xs text-blue-600">{settings.taxaComissaoWin.toFixed(2)}%</div>
                      </div>
                    </div>

                    {/* Repasse Lojista */}
                    <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg border border-green-300">
                      <div className="flex flex-col">
                        <span className="text-green-800 font-medium">🏪 Repasse ao Lojista</span>
                        <span className="text-xs text-green-600">Valor líquido para o vendedor</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-700">R$ {(100 * settings.taxaRepasseLojista / 100).toFixed(2)}</div>
                        <div className="text-xs text-green-600">{settings.taxaRepasseLojista.toFixed(2)}%</div>
                      </div>
                    </div>

                    {/* Valor Entrega */}
                    <div className="flex justify-between items-center bg-orange-100 p-3 rounded-lg border border-orange-300">
                      <div className="flex flex-col">
                        <span className="text-orange-800 font-medium">🚚 Pagamento ao Motorista</span>
                        <span className="text-xs text-orange-600">Valor fixo por entrega (Uber Flash)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-orange-700">R$ {settings.valorEntregaMotorista.toFixed(2)}</div>
                        <div className="text-xs text-orange-600">por entrega</div>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-300">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">📅 Prazo de Repasse:</span>
                        <span className="font-medium text-gray-900">D+{settings.diasRepasse} dias úteis</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">💳 Taxa de Processamento:</span>
                        <span className="font-medium text-gray-900">{settings.taxaProcessamentoPagamento.toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* Nota Importante */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-yellow-800">
                        <strong>⚠️ Nota:</strong> No caso de pedidos com frete, o marketplace recebe também 100% do valor do frete além da comissão sobre os produtos.
                      </p>
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
                    <label htmlFor="taxa-entrega-padrao" className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Entrega Padrão (R$)
                    </label>
                    <input
                      id="taxa-entrega-padrao"
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
                    <label htmlFor="frete-gratis-acima" className="block text-sm font-medium text-gray-700 mb-2">
                      Frete Grátis a partir de (R$)
                    </label>
                    <input
                      id="frete-gratis-acima"
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
                    <label htmlFor="limite-aprovacao" className="block text-sm font-medium text-gray-700 mb-2">
                      Limite Aprovação Automática (R$)
                    </label>
                    <input
                      id="limite-aprovacao"
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
                    <label htmlFor="distancia-maxima" className="block text-sm font-medium text-gray-700 mb-2">
                      Distância Máxima Entrega (km)
                    </label>
                    <input
                      id="distancia-maxima"
                      type="number"
                      value={settings.distanciaMaximaEntregaKm}
                      onChange={(e) =>
                        updateSetting("distanciaMaximaEntregaKm", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="timeout-pedido" className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de Pedido (min)
                    </label>
                    <input
                      id="timeout-pedido"
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
                    <label htmlFor="tempo-preparacao-minimo" className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de Preparação Mínimo (min)
                    </label>
                    <input
                      id="tempo-preparacao-minimo"
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
                    <label htmlFor="tempo-preparacao-maximo" className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de Preparação Máximo (min)
                    </label>
                    <input
                      id="tempo-preparacao-maximo"
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
                    <label htmlFor="raio-maximo-entrega" className="block text-sm font-medium text-gray-700 mb-2">
                      Raio Máximo de Entrega (km)
                    </label>
                    <input
                      id="raio-maximo-entrega"
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
                    <label htmlFor="timeout-busca-motorista" className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout Busca Motorista (min)
                    </label>
                    <input
                      id="timeout-busca-motorista"
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
                    <label htmlFor="duracao-sessao" className="block text-sm font-medium text-gray-700 mb-2">
                      Duração da Sessão (minutos)
                    </label>
                    <input
                      id="duracao-sessao"
                      type="number"
                      value={settings.duracaoSessaoMinutos}
                      onChange={(e) =>
                        updateSetting("duracaoSessaoMinutos", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="tentativas-login" className="block text-sm font-medium text-gray-700 mb-2">
                      Tentativas de Login Máximas
                    </label>
                    <input
                      id="tentativas-login"
                      type="number"
                      value={settings.tentativasLoginMaximas}
                      onChange={(e) =>
                        updateSetting("tentativasLoginMaximas", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="bloqueio-temporario" className="block text-sm font-medium text-gray-700 mb-2">
                      Bloqueio Temporário (minutos)
                    </label>
                    <input
                      id="bloqueio-temporario"
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
                    <label htmlFor="termos-uso-versao" className="block text-sm font-medium text-gray-700 mb-2">
                      Versão Termos de Uso
                    </label>
                    <input
                      id="termos-uso-versao"
                      type="text"
                      value={settings.termosUsoVersao}
                      onChange={(e) =>
                        updateSetting("termosUsoVersao", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="politica-privacidade-versao" className="block text-sm font-medium text-gray-700 mb-2">
                      Versão Política de Privacidade
                    </label>
                    <input
                      id="politica-privacidade-versao"
                      type="text"
                      value={settings.politicaPrivacidadeVersao}
                      onChange={(e) =>
                        updateSetting("politicaPrivacidadeVersao", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="politica-cookies-versao" className="block text-sm font-medium text-gray-700 mb-2">
                      Versão Política de Cookies
                    </label>
                    <input
                      id="politica-cookies-versao"
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
    </AdminLayout>
  );
}
