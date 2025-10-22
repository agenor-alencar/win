import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Store, ArrowLeft, CheckCircle, Loader2, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { api } from "@/lib/Api";
import { buscarCNPJ, buscarCEP, formatarCNPJ, formatarCEP, formatarTelefone } from "@/lib/ExternalApis";

interface LojistaFormData {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  descricao: string;
  telefone: string;
  // Campos de endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export default function BecomeMerchant() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [formData, setFormData] = useState<LojistaFormData>({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    descricao: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  // Verificar se o usuário já é lojista e redirecionar automaticamente
  if (isAuthenticated && user?.perfis?.includes("LOJISTA")) {
    navigate("/merchant/dashboard", { replace: true });
    return null;
  }

  // Verificar se usuário está logado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-[#3DBEAB]/10 rounded-full flex items-center justify-center">
                <Store className="h-8 w-8 text-[#3DBEAB]" />
              </div>
              <CardTitle className="text-2xl">Login Necessário</CardTitle>
              <CardDescription>
                Você precisa estar logado para se tornar um lojista
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
                size="lg"
              >
                Fazer Login
              </Button>
              <Button 
                onClick={() => navigate("/sell")} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar se já é lojista
  if (user?.perfis?.includes("LOJISTA")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Você já é um Lojista!</CardTitle>
              <CardDescription>
                Sua loja já está cadastrada no WIN Marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate("/merchant/dashboard")} 
                className="w-full"
                size="lg"
              >
                Ir para Painel de Lojista
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Voltar para Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");
    
    // Formata: 00.000.000/0000-00
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");
    
    // Formata: (00) 00000-0000 ou (00) 0000-0000
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(\d{4})(\d{4})$/, "$1-$2");
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: formatted }));
  };

  // Buscar dados do CNPJ automaticamente ao sair do campo
  const handleCNPJBlur = async () => {
    const cnpj = formData.cnpj;
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) return;

    try {
      setIsLoadingCNPJ(true);
      const data = await buscarCNPJ(cnpj);
      
      // Verificar situação do CNPJ
      if (data.situacao !== "ATIVA") {
        toast({
          title: "⚠️ Atenção",
          description: `Este CNPJ está com situação: ${data.situacao}`,
          variant: "destructive",
        });
      }
      
      // Preencher formulário automaticamente
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.nome || prev.razaoSocial,
        nomeFantasia: data.fantasia || data.nome || prev.nomeFantasia,
        telefone: data.telefone ? formatarTelefone(data.telefone) : prev.telefone,
        cep: data.cep ? formatarCEP(data.cep) : prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
      }));
      
      toast({
        title: "✅ Dados encontrados!",
        description: "Formulário preenchido automaticamente. Verifique os dados.",
      });
    } catch (error: any) {
      console.error("Erro ao buscar CNPJ:", error);
      
      const errorMessage = error.message || "Não foi possível encontrar os dados";
      const isInvalidCNPJ = errorMessage.includes("inválido") || errorMessage.includes("não encontrado");
      
      toast({
        title: "CNPJ não encontrado",
        description: isInvalidCNPJ 
          ? "CNPJ não encontrado na base da Receita Federal. Verifique o número ou preencha os dados manualmente." 
          : "Não foi possível consultar a API. Preencha os dados manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  // Buscar endereço pelo CEP automaticamente ao sair do campo
  const handleCEPBlur = async () => {
    const cep = formData.cep;
    if (!cep || cep.replace(/\D/g, '').length !== 8) return;

    try {
      setIsLoadingCEP(true);
      const data = await buscarCEP(cep);
      
      // Preencher campos de endereço
      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: data.uf || prev.uf,
      }));
      
      // Focar no campo número
      setTimeout(() => {
        document.getElementById("numero")?.focus();
      }, 100);
      
      toast({
        title: "✅ CEP encontrado!",
        description: "Endereço preenchido. Informe o número.",
      });
    } catch (error: any) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "CEP não encontrado",
        description: "Verifique o CEP ou preencha manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remover formatação do CNPJ, telefone e CEP antes de enviar
      const dataToSend = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        telefone: formData.telefone.replace(/\D/g, ""),
        cep: formData.cep.replace(/\D/g, ""),
        uf: formData.uf.toUpperCase(), // Garantir UF em maiúsculas
      };

      // 1. Cadastrar como lojista
      await api.post("/api/v1/usuario/tornar-lojista", dataToSend);

      // 2. Obter novo token com perfis atualizados (USER + LOJISTA)
      const refreshResponse = await api.post(`/api/v1/auth/refresh-token?email=${user?.email}`);
      
      // 3. Mapear dados do backend para o formato do frontend
      if (refreshResponse.data.access_token && refreshResponse.data.usuario) {
        const usuarioBackend = refreshResponse.data.usuario;
        
        // Mapear perfis do backend (ADMIN, LOJISTA, MOTORISTA, USER)
        // para frontend (admin, merchant, driver, user)
        const perfisArray = Array.isArray(usuarioBackend.perfis) ? usuarioBackend.perfis : [];
        
        let role: string | undefined;
        if (perfisArray.includes('ADMIN')) {
          role = 'admin';
        } else if (perfisArray.includes('LOJISTA')) {
          role = 'merchant';
        } else if (perfisArray.includes('MOTORISTA')) {
          role = 'driver';
        } else if (perfisArray.includes('USER')) {
          role = 'user';
        }
        
        // Criar objeto User no formato correto do frontend
        const frontendUser = {
          id: usuarioBackend.id,
          nome: usuarioBackend.nome,
          email: usuarioBackend.email,
          telefone: usuarioBackend.telefone,
          role, // role mapeado (merchant)
          perfis: perfisArray, // Array original de perfis
          ativo: usuarioBackend.ativo,
          enderecos: usuarioBackend.enderecos || [],
          dataCriacao: usuarioBackend.dataCriacao,
          ultimoAcesso: usuarioBackend.ultimoAcesso,
        };
        
        console.log('🔄 Usuário promovido para lojista:', frontendUser);
        console.log('📋 Perfis:', perfisArray);
        console.log('🎭 Role mapeado:', role);
        
        // 4. Atualizar token e usuário no localStorage
        localStorage.setItem("win-token", refreshResponse.data.access_token);
        localStorage.setItem("win-user", JSON.stringify(frontendUser));
        
        // 5. Atualizar contexto de autenticação
        updateUser(frontendUser);
      }

      toast({
        title: "🎉 Parabéns!",
        description: "Você agora é um lojista do WIN! Redirecionando para o painel...",
        variant: "default",
      });

      // Aguardar 2 segundos para garantir que o contexto foi atualizado
      setTimeout(() => {
        // Forçar reload da página para garantir que as rotas sejam recalculadas
        window.location.href = "/merchant/dashboard";
      }, 2000);
      
    } catch (error: any) {
      console.error("Erro ao cadastrar loja:", error);
      toast({
        title: "Erro ao Cadastrar Loja",
        description: error.response?.data?.message || "Erro ao cadastrar loja. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/sell")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#3DBEAB]/10 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-[#3DBEAB]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cadastre sua Loja no WIN
              </h1>
              <p className="text-gray-600 mt-1">
                Preencha os dados abaixo para começar a vender
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
            <CardDescription>
              Todos os campos marcados com * são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Fantasia */}
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">
                  Nome da Loja (Nome Fantasia) *
                </Label>
                <Input
                  id="nomeFantasia"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  placeholder="Ex: Ferragens Silva"
                  required
                  minLength={3}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500">
                  Nome que aparecerá para os clientes
                </p>
              </div>

              {/* Razão Social */}
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">
                  Razão Social *
                </Label>
                <Input
                  id="razaoSocial"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  placeholder="Ex: Silva & Cia Ltda"
                  required
                  minLength={3}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500">
                  Nome oficial registrado no CNPJ
                </p>
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj">
                  CNPJ *
                </Label>
                <div className="relative">
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleCNPJChange}
                    onBlur={handleCNPJBlur}
                    placeholder="00.000.000/0000-00"
                    required
                    maxLength={18}
                    disabled={isLoadingCNPJ}
                  />
                  {isLoadingCNPJ && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {isLoadingCNPJ ? "Buscando dados da empresa..." : "Digite o CNPJ e os dados serão preenchidos automaticamente"}
                </p>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone Comercial
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  placeholder="(61) 99999-9999"
                  maxLength={15}
                />
                <p className="text-sm text-gray-500">
                  Opcional - Telefone para contato comercial
                </p>
              </div>

              {/* Divisor - Endereço */}
              <div className="pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-[#3DBEAB]" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Endereço da Loja
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  O endereço é necessário para que clientes da sua região possam encontrar e receber produtos da sua loja.
                </p>
              </div>

              {/* CEP */}
              <div className="space-y-2">
                <Label htmlFor="cep">
                  CEP *
                </Label>
                <div className="relative">
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleCEPChange}
                    onBlur={handleCEPBlur}
                    placeholder="00000-000"
                    required
                    maxLength={9}
                    disabled={isLoadingCEP}
                  />
                  {isLoadingCEP && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {isLoadingCEP ? "Buscando endereço..." : "Digite o CEP e o endereço será preenchido automaticamente"}
                </p>
              </div>

              {/* Grid 2 colunas - Logradouro e Número */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="logradouro">
                    Logradouro (Rua/Avenida) *
                  </Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                    placeholder="Ex: Rua das Flores"
                    required
                    minLength={3}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">
                    Número *
                  </Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="123"
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Complemento */}
              <div className="space-y-2">
                <Label htmlFor="complemento">
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Ex: Sala 10, Bloco A"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500">
                  Opcional - Apartamento, sala, bloco, etc
                </p>
              </div>

              {/* Grid 3 colunas - Bairro, Cidade, UF */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">
                    Bairro *
                  </Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    placeholder="Centro"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">
                    Cidade *
                  </Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="São Paulo"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">
                    UF *
                  </Label>
                  <Input
                    id="uf"
                    name="uf"
                    value={formData.uf}
                    onChange={handleChange}
                    placeholder="SP"
                    required
                    maxLength={2}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição da Loja
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Conte sobre sua loja, produtos e diferenciais... (mínimo 20 caracteres)"
                  rows={5}
                  minLength={20}
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500">
                  Opcional - {formData.descricao.length}/1000 caracteres
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/sell")}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Minha Loja"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ O que acontece depois?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ Sua loja será cadastrada imediatamente</li>
            <li>✅ Você terá acesso ao Painel de Lojista</li>
            <li>✅ Poderá cadastrar produtos e gerenciar pedidos</li>
            <li>✅ Seu perfil terá acesso de CLIENTE e LOJISTA</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
