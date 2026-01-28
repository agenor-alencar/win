import React, { useState, useEffect } from "react";
import { MapPin, Truck, CheckCircle, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { shippingApi } from "@/lib/api/shippingApi";
import { api } from "@/lib/Api";

interface CEPWidgetProps {
  lojistaId?: string;
  compact?: boolean;
}

const CEPWidget: React.FC<CEPWidgetProps> = ({ lojistaId, compact = false }) => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [freteEstimado, setFreteEstimado] = useState<number | null>(null);
  const [tempoEstimado, setTempoEstimado] = useState<number | null>(null);
  const [enderecoSalvo, setEnderecoSalvo] = useState(false);
  const [mostrarWidget, setMostrarWidget] = useState(true);

  // Carregar CEP salvo
  useEffect(() => {
    const cepSalvo = localStorage.getItem('win_cep_cliente');
    if (cepSalvo) {
      setCep(cepSalvo);
      setEnderecoSalvo(true);
    }
  }, []);

  const formatarCep = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 5) {
      return numeros;
    }
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCep(e.target.value);
    setCep(valorFormatado);
    setEnderecoSalvo(false);
  };

  const salvarCepECalcularFrete = async () => {
    const cepLimpo = cep.replace(/\D/g, "");
    
    if (cepLimpo.length !== 8) {
      showError("CEP inválido", "Digite um CEP válido com 8 dígitos");
      return;
    }

    setLoading(true);

    try {
      // 1. Buscar dados do CEP
      const responseCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dadosCep = await responseCep.json();

      if (dadosCep.erro) {
        showError("CEP não encontrado", "Verifique o CEP digitado");
        setLoading(false);
        return;
      }

      // 2. Salvar CEP no localStorage
      localStorage.setItem('win_cep_cliente', cepLimpo);

      // 3. Se usuário estiver logado, criar/atualizar endereço temporário
      if (user) {
        try {
          const enderecoTemp = {
            usuarioId: user.id,
            cep: cepLimpo,
            logradouro: dadosCep.logradouro || "",
            numero: "S/N",
            complemento: "Endereço temporário (será completado no checkout)",
            bairro: dadosCep.bairro || "",
            cidade: dadosCep.localidade || "",
            estado: dadosCep.uf || "",
            principal: false,
            ativo: true,
            temporario: true
          };

          // Criar endereço temporário
          const responseEndereco = await api.post('/v1/enderecos', enderecoTemp);
          localStorage.setItem('win_endereco_temp_id', responseEndereco.data.id);
          
          console.log('✅ Endereço temporário criado:', responseEndereco.data.id);
        } catch (error) {
          console.warn('Não foi possível criar endereço temporário:', error);
          // Continua mesmo sem criar endereço (cálculo por CEP ainda funciona)
        }
      }

      // 4. Calcular estimativa de frete (se tiver lojistaId)
      if (lojistaId) {
        try {
          const estimativa = await shippingApi.estimarFretePorCep(cepLimpo, lojistaId, 1.0);
          
          if (estimativa.sucesso) {
            setFreteEstimado(estimativa.valorFreteTotal);
            setTempoEstimado(estimativa.tempoEstimadoMinutos);
            setEnderecoSalvo(true);
            
            success(
              "CEP Salvo! 📍",
              `Frete estimado: R$ ${estimativa.valorFreteTotal.toFixed(2)} em ~${estimativa.tempoEstimadoMinutos}min`
            );
          } else {
            // Mesmo sem frete, salva o CEP
            setEnderecoSalvo(true);
            success("CEP Salvo!", "Complete seu endereço no checkout para calcular o frete");
          }
        } catch (error) {
          console.warn('Erro ao estimar frete:', error);
          setEnderecoSalvo(true);
          success("CEP Salvo!", "Complete seu endereço no checkout");
        }
      } else {
        setEnderecoSalvo(true);
        success("CEP Salvo!", `${dadosCep.localidade}/${dadosCep.uf}. Complete no checkout.`);
      }

    } catch (error) {
      console.error('Erro ao processar CEP:', error);
      showError("Erro", "Não foi possível processar o CEP");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      salvarCepECalcularFrete();
    }
  };

  if (!mostrarWidget) {
    return null;
  }

  // Versão compacta (para header/navbar)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-orange-500" />
        <input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={handleCepChange}
          onKeyPress={handleKeyPress}
          maxLength={9}
          className="w-32 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={salvarCepECalcularFrete}
          disabled={loading || cep.replace(/\D/g, "").length !== 8}
          className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "OK"}
        </button>
        {enderecoSalvo && (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
    );
  }

  // Versão completa (para home/banner)
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white relative">
      <button
        onClick={() => setMostrarWidget(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
        title="Fechar widget"
        aria-label="Fechar widget de CEP"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Ícone e texto */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-full">
            <Truck className="h-8 w-8" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg">
              📍 Calcule o Frete para sua Região
            </h3>
            <p className="text-sm text-white/90">
              Digite seu CEP e descubra quanto custa a entrega
            </p>
          </div>
        </div>

        {/* Input CEP */}
        <div className="flex-1 flex items-center gap-2 bg-white rounded-lg p-2 min-w-[300px]">
          <MapPin className="h-5 w-5 text-orange-500 ml-2" />
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={handleCepChange}
            onKeyPress={handleKeyPress}
            maxLength={9}
            className="flex-1 px-2 py-2 text-gray-800 focus:outline-none"
          />
          <button
            onClick={salvarCepECalcularFrete}
            disabled={loading || cep.replace(/\D/g, "").length !== 8}
            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" />
                Calcular Frete
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        {enderecoSalvo && freteEstimado && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-300" />
            <div className="text-left">
              <p className="font-bold text-lg">R$ {freteEstimado.toFixed(2)}</p>
              <p className="text-xs text-white/90">em ~{tempoEstimado}min</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CEPWidget;
