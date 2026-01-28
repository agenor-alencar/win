import React, { useState, useEffect } from "react";
import { MapPin, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { api } from "@/lib/Api";

interface CEPWidgetProps {
  lojistaId?: string;
}

const CEPWidget: React.FC<CEPWidgetProps> = ({ lojistaId }) => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [enderecoSalvo, setEnderecoSalvo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Carregar CEP salvo
  useEffect(() => {
    const cepSalvo = localStorage.getItem('win_cep_cliente');
    if (cepSalvo) {
      setCep(formatarCep(cepSalvo));
      setEnderecoSalvo(true);
    }
  }, []);

  const formatarCep = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 5) return numeros;
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCep(e.target.value);
    setCep(valorFormatado);
    setEnderecoSalvo(false);
  };

  const salvarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, "");
    
    if (cepLimpo.length !== 8) {
      showError("CEP inválido", "Digite um CEP válido com 8 dígitos");
      return;
    }

    setLoading(true);

    try {
      console.log("🔍 Validando CEP:", cepLimpo);

      // 1. Buscar dados do CEP
      const responseCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dadosCep = await responseCep.json();

      if (dadosCep.erro) {
        showError("CEP não encontrado", "Verifique o CEP digitado");
        setLoading(false);
        return;
      }

      console.log("✅ CEP válido:", dadosCep);

      // 2. Salvar CEP no localStorage
      localStorage.setItem('win_cep_cliente', cepLimpo);

      // 3. Se usuário estiver logado, criar/atualizar endereço temporário
      if (user) {
        try {
          const enderecoTemp = {
            cep: cepLimpo,
            logradouro: dadosCep.logradouro || "",
            numero: "S/N",
            complemento: "",
            bairro: dadosCep.bairro || "",
            cidade: dadosCep.localidade || "",
            estado: dadosCep.uf || "",
            principal: false,
            temporario: true
          };

          console.log("💾 Salvando endereço temporário:", enderecoTemp);

          const response = await api.post("/api/v1/enderecos", enderecoTemp);
          
          if (response.data?.id) {
            localStorage.setItem('win_endereco_temp_id', response.data.id);
            console.log("✅ Endereço temporário salvo:", response.data.id);
          }
        } catch (error) {
          console.error("⚠️ Erro ao salvar endereço temporário:", error);
          // Não bloqueia o fluxo - o CEP foi salvo no localStorage
        }
      }

      setEnderecoSalvo(true);
      setMostrarForm(false);
      success(
        "CEP salvo!", 
        `${dadosCep.localidade}/${dadosCep.uf}. O frete será calculado no checkout.`
      );

    } catch (error) {
      console.error("❌ Erro ao processar CEP:", error);
      showError("Erro", "Não foi possível validar o CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      salvarCep();
    }
  };

  // Widget minimalista no canto superior direito
  return (
    <div className="fixed top-20 right-4 z-40">
      {!mostrarForm && (
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all flex items-center gap-2 group"
          title="Informar seu CEP"
        >
          <MapPin className="h-5 w-5 text-orange-500" />
          {enderecoSalvo ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 max-w-0 overflow-hidden group-hover:max-w-xs transition-all">
                CEP: {cep}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-700 max-w-0 overflow-hidden group-hover:max-w-xs transition-all">
              Informe seu CEP
            </span>
          )}
        </button>
      )}

      {mostrarForm && (
        <div className="bg-white shadow-xl rounded-lg p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-800">Seu CEP</h3>
            </div>
            <button
              onClick={() => setMostrarForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Informe seu CEP para calcular o frete no checkout
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              onKeyPress={handleKeyPress}
              maxLength={9}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <button
              onClick={salvarCep}
              disabled={loading || cep.replace(/\D/g, "").length !== 8}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </button>
          </div>

          {enderecoSalvo && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>CEP salvo com sucesso!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CEPWidget;
