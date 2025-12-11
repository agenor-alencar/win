import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { erpApi, ErpType, ErpConfig, ErpConfigRequest } from '../../lib/api/ErpApi';
import { useToast } from '../../hooks/use-toast';
import { MerchantLayout } from '../../components/MerchantLayout';

export const ErpConfigPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const lojistaId = user?.id || '';

  const [erpTypes, setErpTypes] = useState<ErpType[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ErpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulário
  const [selectedType, setSelectedType] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [syncFrequency, setSyncFrequency] = useState(5);
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [tipos, config] = await Promise.all([
        erpApi.listarTiposErp(),
        erpApi.buscarConfiguracao(lojistaId),
      ]);

      setErpTypes(tipos);
      setCurrentConfig(config);

      // Preencher formulário se já existe configuração
      if (config) {
        setSelectedType(config.erpType);
        setApiUrl(config.apiUrl);
        setSyncFrequency(config.syncFrequencyMinutes);
        setSyncEnabled(config.syncEnabled);
        // API Key não é retornada por segurança
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar configurações',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleErpTypeChange = (type: string) => {
    setSelectedType(type);
    const erpType = erpTypes.find((t) => t.value === type);
    if (erpType?.defaultApiUrl) {
      setApiUrl(erpType.defaultApiUrl);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast({
        title: 'Selecione um tipo de ERP',
        variant: 'destructive',
      });
      return;
    }

    const erpType = erpTypes.find((t) => t.value === selectedType);
    if (erpType?.requiresApiKey === 'true' && !apiKey && !currentConfig) {
      toast({
        title: 'Informe a chave de API',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const request: ErpConfigRequest = {
        erpType: selectedType,
        apiUrl: apiUrl || undefined,
        apiKey: apiKey || undefined,
        syncFrequencyMinutes: syncFrequency,
        syncEnabled,
      };

      await erpApi.configurarErp(lojistaId, request);

      toast({
        title: 'Configuração salva com sucesso!',
      });
      setApiKey(''); // Limpar campo de senha
      await carregarDados(); // Recarregar
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao salvar configuração';
      toast({
        title: message,
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDesvincular = async () => {
    if (
      !confirm(
        'Tem certeza que deseja desvincular o ERP? A sincronização automática será desativada.'
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await erpApi.desvincularErp(lojistaId);
      toast({
        title: 'ERP desvinculado com sucesso',
      });
      setCurrentConfig(null);
      setSelectedType('');
      setApiUrl('');
      setApiKey('');
    } catch (error) {
      toast({
        title: 'Erro ao desvincular ERP',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </MerchantLayout>
    );
  }

  const selectedErpType = erpTypes.find((t) => t.value === selectedType);

  return (
    <MerchantLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Integração com ERP
          </h1>
          <p className="text-gray-600 mt-2">
            Configure a sincronização automática de produtos e estoque com seu
            sistema ERP
          </p>
        </div>

        {/* Status atual */}
        {currentConfig && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  ERP Configurado: {currentConfig.erpName}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-blue-800">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {currentConfig.syncEnabled ? 'Ativo' : 'Inativo'}
                  </p>
                  <p>
                    <span className="font-medium">Frequência:</span> A cada{' '}
                    {currentConfig.syncFrequencyMinutes} minuto(s)
                  </p>
                  {currentConfig.lastSyncAt && (
                    <>
                      <p>
                        <span className="font-medium">Última sincronização:</span>{' '}
                        {new Date(currentConfig.lastSyncAt).toLocaleString('pt-BR')}
                      </p>
                      <p>
                        <span className="font-medium">Status da sincronização:</span>{' '}
                        <span
                          className={
                            currentConfig.lastSyncStatus === 'SUCCESS'
                              ? 'text-green-700'
                              : 'text-red-700'
                          }
                        >
                          {currentConfig.lastSyncStatus === 'SUCCESS'
                            ? 'Sucesso'
                            : 'Erro'}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleDesvincular}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Desvincular
              </button>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSalvar} className="space-y-6">
            {/* Tipo de ERP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de ERP *
              </label>
              <select
                value={selectedType}
                onChange={(e) => handleErpTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {erpTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* URL da API */}
            {selectedType && selectedType !== 'MANUAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da API
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder={selectedErpType?.defaultApiUrl}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Deixe em branco para usar a URL padrão
                </p>
              </div>
            )}

            {/* Chave de API */}
            {selectedErpType?.requiresApiKey === 'true' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave de API {!currentConfig && '*'}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    currentConfig ? '••••••••••••••••' : 'Digite a chave de API'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={!currentConfig}
                />
                {currentConfig && (
                  <p className="text-sm text-gray-500 mt-1">
                    Deixe em branco para manter a chave atual
                  </p>
                )}
              </div>
            )}

            {/* Frequência de Sincronização */}
            {selectedType && selectedType !== 'MANUAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência de Sincronização: {syncFrequency} minuto(s)
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 min</span>
                  <span>60 min</span>
                </div>
              </div>
            )}

            {/* Sincronização Ativa */}
            {selectedType && selectedType !== 'MANUAL' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="syncEnabled"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="syncEnabled" className="ml-2 text-sm text-gray-700">
                  Ativar sincronização automática
                </label>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {saving ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </div>
          </form>
        </div>

        {/* Informações */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Como funciona a integração?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • <strong>Sincronização automática:</strong> O estoque dos produtos
              vinculados ao ERP será atualizado automaticamente na frequência
              configurada.
            </li>
            <li>
              • <strong>Vinculação por SKU:</strong> Ao criar produtos, você pode
              vinculá-los a produtos do ERP usando o código SKU.
            </li>
            <li>
              • <strong>Importação de dados:</strong> É possível importar
              automaticamente nome, descrição, preço e estoque do ERP.
            </li>
            <li>
              • <strong>Modo Manual:</strong> Produtos sem ERP continuam
              funcionando normalmente com gestão manual de estoque.
            </li>
          </ul>
        </div>
      </div>
    </MerchantLayout>
  );
};
