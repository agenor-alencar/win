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

          const response = await api.post("/v1/enderecos", enderecoTemp);
          
          if (response.data?.id) {
            const enderecoSalvo = response.data;
            localStorage.setItem('win_endereco_temp_id', enderecoSalvo.id);
            console.log("✅ Endereço temporário salvo:", enderecoSalvo.id);
            
            // ✅ VALIDAÇÃO: Verificar se foi geocodificado
            if (enderecoSalvo.latitude && enderecoSalvo.longitude) {
              console.log("✅ Endereço geocodificado:", {
                lat: enderecoSalvo.latitude,
                lon: enderecoSalvo.longitude
              });
            } else {
              console.warn("⚠️ Endereço salvo mas ainda sem coordenadas (geocodificação pendente)");
            }
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

  // Widget compacto inline para o Header
  return (
    <div className="relative">
      {!mostrarForm ? (
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition-all text-xs font-medium text-orange-700"
          title="Informar seu CEP"
        >
          <MapPin className="h-3.5 w-3.5" />
          {enderecoSalvo ? (
            <>
              <span>CEP: {cep}</span>
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            </>
          ) : (
            <span>Informar CEP</span>
          )}
        </button>
      ) : (
        <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-lg p-4 w-80 z-50 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Informar CEP</h3>
            </div>
            <button
              onClick={() => setMostrarForm(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Digite seu CEP para calcular o frete no checkout
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              onKeyPress={handleKeyPress}
              maxLength={9}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              autoFocus
            />
            <button
              onClick={salvarCep}
              disabled={loading || cep.replace(/\D/g, "").length !== 8}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </button>
          </div>

          {enderecoSalvo && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1.5 rounded">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>CEP salvo! Será usado no checkout.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CEPWidget;
