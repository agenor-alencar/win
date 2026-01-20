import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/Api';

interface CEPRapidoProps {
  onCepCalculado?: (valorFrete: number, cep: string) => void;
  lojistaId?: string;
  className?: string;
  modo?: 'header' | 'produto'; // 'header' mostra compacto, 'produto' mostra detalhado
}

interface FreteEstimativa {
  sucesso: boolean;
  valorFreteTotal: number;
  tempoEstimadoMinutos: number;
  distanciaKm: number;
  mensagem?: string;
  erro?: string;
}

/**
 * Componente de CEP rápido para estimativa antecipada de frete.
 * 
 * Uso:
 * - No Header: <CEPRapido modo="header" />
 * - Na página do produto: <CEPRapido modo="produto" lojistaId={produto.lojistaId} />
 * 
 * Salva CEP no localStorage para uso posterior no checkout.
 */
export const CEPRapido: React.FC<CEPRapidoProps> = ({ 
  onCepCalculado, 
  lojistaId,
  className = '',
  modo = 'header'
}) => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimativa, setEstimativa] = useState<FreteEstimativa | null>(null);
  const [erro, setErro] = useState('');
  const [mostrarInput, setMostrarInput] = useState(false);

  // Carregar CEP salvo do localStorage
  useEffect(() => {
    const cepSalvo = localStorage.getItem('win_cep_cliente');
    if (cepSalvo) {
      setCep(cepSalvo);
      setMostrarInput(true);
    }
  }, []);

  const formatarCEP = (valor: string): string => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 5) {
      return numeros;
    }
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarCEP(e.target.value);
    setCep(valorFormatado);
    setErro('');
    setEstimativa(null);
  };

  const calcularFrete = async () => {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setErro('CEP deve ter 8 dígitos');
      return;
    }

    if (!lojistaId && modo === 'produto') {
      setErro('Lojista não identificado');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      // Salvar CEP no localStorage
      localStorage.setItem('win_cep_cliente', cep);

      // Usar lojistaId se fornecido, senão pega primeiro lojista ativo (fallback)
      const lojistaParam = lojistaId || await buscarPrimeiroLojista();

      const response = await api.get(`/v1/fretes/estimar`, {
        params: {
          cepDestino: cepLimpo,
          lojistaId: lojistaParam,
          pesoKg: 1.0
        }
      });

      const resultado: FreteEstimativa = response.data;
      setEstimativa(resultado);

      if (resultado.sucesso && onCepCalculado) {
        onCepCalculado(resultado.valorFreteTotal, cep);
      }
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      setErro(error.response?.data?.message || 'Erro ao calcular frete');
    } finally {
      setLoading(false);
    }
  };

  const buscarPrimeiroLojista = async (): Promise<string> => {
    try {
      const response = await api.get('/v1/lojistas?page=0&size=1');
      const lojistas = response.data.content || response.data;
      if (lojistas.length > 0) {
        return lojistas[0].id;
      }
      throw new Error('Nenhum lojista encontrado');
    } catch (error) {
      throw new Error('Erro ao buscar lojista');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calcularFrete();
    }
  };

  // Modo compacto para header
  if (modo === 'header' && !mostrarInput) {
    return (
      <button
        onClick={() => setMostrarInput(true)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors ${className}`}
      >
        <MapPin className="w-4 h-4" />
        <span className="hidden sm:inline">Calcular frete</span>
      </button>
    );
  }

  // Modo expandido
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          {modo === 'header' ? 'Informe seu CEP' : 'Calcule o frete'}
        </h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={handleCepChange}
          onKeyPress={handleKeyPress}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={calcularFrete}
          disabled={loading || cep.replace(/\D/g, '').length !== 8}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Calculando...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">OK</span>
            </>
          )}
        </button>
      </div>

      {erro && (
        <div className="mt-2 text-sm text-red-600">
          {erro}
        </div>
      )}

      {estimativa && estimativa.sucesso && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900">
                Frete: R$ {estimativa.valorFreteTotal.toFixed(2)}
              </p>
              <p className="text-xs text-green-700">
                Entrega em ~{estimativa.tempoEstimadoMinutos} min ({estimativa.distanciaKm.toFixed(1)} km)
              </p>
            </div>
            <Check className="w-5 h-5 text-green-600" />
          </div>
          {estimativa.mensagem && (
            <p className="text-xs text-gray-600 mt-2">{estimativa.mensagem}</p>
          )}
        </div>
      )}

      {modo === 'header' && (
        <p className="mt-2 text-xs text-gray-500">
          O valor será confirmado no checkout com o endereço completo.
        </p>
      )}
    </div>
  );
};

export default CEPRapido;
