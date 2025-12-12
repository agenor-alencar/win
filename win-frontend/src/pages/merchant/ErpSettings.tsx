import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Loader2, Settings, AlertCircle, Unplug, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/Api";
import { MerchantLayout } from "@/components/MerchantLayout";
import { erpApi, ErpConfig } from "@/lib/api/ErpApi";

interface ErpType {
  name: string;
  displayName: string;
  description: string;
}

export default function ErpSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [lojistaId, setLojistaId] = useState<string | null>(null);
  const [erpTypes, setErpTypes] = useState<ErpType[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ErpConfig | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    erpType: "",
    apiUrl: "",
    apiKey: "",
    syncFrequencyMinutes: "5",
    syncEnabled: true,
  });

  // Buscar ID do lojista
  useEffect(() => {
    const fetchLojistaId = async () => {
      if (!user?.email) return;

      try {
        const lojistaResponse = await api.get(`/v1/lojistas/me`);
        setLojistaId(lojistaResponse.data.id);
      } catch (error: any) {
        console.error("Erro ao buscar dados do lojista:", error);
        toast({
          title: "Erro ao identificar lojista",
          description: "Não foi possível identificar seu perfil de lojista.",
          variant: "destructive",
        });
      }
    };

    fetchLojistaId();
  }, [user, toast]);

  // Carregar tipos de ERP e configuração atual
  useEffect(() => {
    const loadData = async () => {
      if (!lojistaId) return;

      setIsLoading(true);
      try {
        // Buscar tipos de ERP disponíveis
        const types = await erpApi.listarTiposErp();
        setErpTypes(types);

        // Buscar configuração atual
        try {
          const config = await erpApi.buscarConfiguracao(lojistaId);
          if (config) {
            setCurrentConfig(config);
            setFormData({
              erpType: config.erpType,
              apiUrl: config.apiUrl || "",
              apiKey: "", // Nunca retorna por segurança
              syncFrequencyMinutes: config.syncFrequencyMinutes?.toString() || "5",
              syncEnabled: config.ativo,
            });
          }
        } catch (error) {
          // Sem configuração ainda
          console.log("Nenhuma configuração ERP encontrada");
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações de ERP.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lojistaId, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTestResult(null); // Limpa resultado do teste ao alterar dados
  };

  const handleTestConnection = async () => {
    if (!lojistaId) return;

    if (!formData.erpType || !formData.apiKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o tipo de ERP e a API Key para testar a conexão.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Chama o endpoint de configurar com dryRun (não salva)
      await erpApi.configurarErp(lojistaId, {
        erpType: formData.erpType,
        apiUrl: formData.apiUrl || undefined,
        apiKey: formData.apiKey,
        syncFrequencyMinutes: parseInt(formData.syncFrequencyMinutes),
        syncEnabled: false, // Teste não ativa sincronização
      });

      setTestResult({
        success: true,
        message: "Conexão estabelecida com sucesso! As credenciais estão corretas.",
      });

      toast({
        title: "Conexão bem-sucedida!",
        description: "O sistema conseguiu se conectar ao ERP.",
      });
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      const errorMessage = error.response?.data?.message || "Falha ao conectar com o ERP";

      setTestResult({
        success: false,
        message: errorMessage,
      });

      toast({
        title: "Falha na conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lojistaId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu perfil de lojista.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.erpType) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione o tipo de ERP.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.apiKey && !currentConfig) {
      toast({
        title: "Campo obrigatório",
        description: "Informe a API Key do seu ERP.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await erpApi.configurarErp(lojistaId, {
        erpType: formData.erpType,
        apiUrl: formData.apiUrl || undefined,
        apiKey: formData.apiKey || undefined, // Só envia se foi preenchida
        syncFrequencyMinutes: parseInt(formData.syncFrequencyMinutes),
        syncEnabled: formData.syncEnabled,
      });

      toast({
        title: "✅ Configuração salva!",
        description: "A integração com o ERP foi configurada com sucesso.",
      });

      // Recarregar configuração
      const config = await erpApi.buscarConfiguracao(lojistaId);
      setCurrentConfig(config);
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.message || "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!lojistaId) return;

    if (!confirm("Tem certeza que deseja desvincular o ERP? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDisconnecting(true);

    try {
      await erpApi.desvincularErp(lojistaId);

      toast({
        title: "ERP desvinculado",
        description: "A integração com o ERP foi removida.",
      });

      // Limpar estado
      setCurrentConfig(null);
      setFormData({
        erpType: "",
        apiUrl: "",
        apiKey: "",
        syncFrequencyMinutes: "5",
        syncEnabled: true,
      });
      setTestResult(null);
    } catch (error: any) {
      console.error("Erro ao desvincular ERP:", error);
      toast({
        title: "Erro ao desvincular",
        description: error.response?.data?.message || "Não foi possível desvincular o ERP.",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <MerchantLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3DBEAB]" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => navigate("/merchant")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Dashboard
          </Button>

          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#3DBEAB]" />
            Configuração de ERP
          </h1>
          <p className="text-gray-600 mt-1">
            Integre seu sistema ERP para sincronizar produtos automaticamente
          </p>
        </div>

        {/* Status Atual */}
        {currentConfig && (
          <Alert className={currentConfig.ativo ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
            <CheckCircle className={`h-4 w-4 ${currentConfig.ativo ? "text-green-600" : "text-yellow-600"}`} />
            <AlertDescription className={currentConfig.ativo ? "text-green-800" : "text-yellow-800"}>
              <strong>ERP Conectado:</strong> {currentConfig.erpType}
              <br />
              <strong>Status:</strong> {currentConfig.ativo ? "Sincronização ativa" : "Sincronização pausada"}
              <br />
              {currentConfig.lastSyncAt && (
                <>
                  <strong>Última sincronização:</strong>{" "}
                  {new Date(currentConfig.lastSyncAt).toLocaleString("pt-BR")}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Integração</CardTitle>
            <CardDescription>Configure as credenciais e parâmetros do seu ERP</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de ERP */}
              <div>
                <Label htmlFor="erpType">Tipo de ERP *</Label>
                <Select
                  value={formData.erpType}
                  onValueChange={(value) => handleInputChange("erpType", value)}
                  disabled={!!currentConfig}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu ERP" />
                  </SelectTrigger>
                  <SelectContent>
                    {erpTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        <div>
                          <div className="font-medium">{type.displayName}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentConfig && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Não é possível alterar o tipo de ERP. Para trocar, desvincule e configure novamente.
                  </p>
                )}
              </div>

              {/* URL da API (opcional para alguns ERPs) */}
              {formData.erpType === "CUSTOM_API" && (
                <div>
                  <Label htmlFor="apiUrl">URL da API</Label>
                  <Input
                    id="apiUrl"
                    type="url"
                    placeholder="https://api.seuerpgo.com.br"
                    value={formData.apiUrl}
                    onChange={(e) => handleInputChange("apiUrl", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">URL base da API do seu ERP customizado</p>
                </div>
              )}

              {/* API Key */}
              <div>
                <Label htmlFor="apiKey">
                  API Key / Token {currentConfig ? "(deixe em branco para não alterar)" : "*"}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={currentConfig ? "••••••••••••" : "Cole sua API Key aqui"}
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange("apiKey", e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentConfig
                    ? "Por segurança, a chave atual não é exibida"
                    : "Chave de autenticação do seu ERP (criptografada no servidor)"}
                </p>
              </div>

              {/* Frequência de Sincronização */}
              <div>
                <Label htmlFor="syncFrequency">Frequência de Sincronização (minutos)</Label>
                <Input
                  id="syncFrequency"
                  type="number"
                  min="1"
                  max="1440"
                  placeholder="5"
                  value={formData.syncFrequencyMinutes}
                  onChange={(e) => handleInputChange("syncFrequencyMinutes", e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Intervalo entre sincronizações automáticas (recomendado: 5 minutos)
                </p>
              </div>

              {/* Sincronização Ativa */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncEnabled"
                  checked={formData.syncEnabled}
                  onChange={(e) => handleInputChange("syncEnabled", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                />
                <Label htmlFor="syncEnabled" className="cursor-pointer">
                  Ativar sincronização automática de estoque
                </Label>
              </div>

              {/* Resultado do Teste */}
              {testResult && (
                <Alert className={testResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || isSaving || !formData.erpType || !formData.apiKey}
                  className="flex-1"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                <Button
                  type="submit"
                  className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90 flex-1"
                  disabled={isSaving || isTesting}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{currentConfig ? "Atualizar Configuração" : "Salvar Configuração"}</>
                  )}
                </Button>
              </div>

              {/* Desvincular ERP */}
              {currentConfig && (
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="w-full"
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Desvinculando...
                      </>
                    ) : (
                      <>
                        <Unplug className="h-4 w-4 mr-2" />
                        Desvincular ERP
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ⚠️ Esta ação removerá a integração, mas não deletará os produtos já cadastrados
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Ajuda */}
        <Card>
          <CardHeader>
            <CardTitle>Como funciona a integração?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1. Configure seu ERP:</strong> Selecione o tipo de ERP e informe suas credenciais de API.
            </p>
            <p>
              <strong>2. Importe produtos:</strong> Ao criar um novo produto, você poderá buscar pelo SKU no ERP e
              importar todos os dados automaticamente.
            </p>
            <p>
              <strong>3. Sincronização automática:</strong> O sistema atualizará o estoque dos seus produtos
              vinculados ao ERP automaticamente no intervalo configurado.
            </p>
            <p className="text-xs text-gray-500">
              💡 Seus produtos que não forem vinculados ao ERP continuarão funcionando normalmente com controle manual
              de estoque.
            </p>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
