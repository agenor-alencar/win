import { useState, useCallback } from 'react';
import { TipoPinValidacao } from '../types/entrega';

interface ValidarPinRequestDTO {
  entregaId: string;
  pin: string;
  tipo: TipoPinValidacao;
}

interface ValidarPinResponseDTO {
  pinId: string;
  entregaId: string;
  tipo: TipoPinValidacao;
  validado: boolean;
  mensagem: string;
  tentativasRestantes: number;
  bloqueado: boolean;
  bloqueadoAte?: string;
  dataValidacao?: string;
}

/**
 * Hook customizado para validação de PIN codes.
 * 
 * Funcionalidades:
 * - Validar PIN com proteção contra brute force
 * - Rastrear tentativas restantes
 * - Detectar bloqueio por brute force
 */
export function usePinValidacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ValidarPinResponseDTO | null>(null);

  const validarPin = useCallback(async (request: ValidarPinRequestDTO) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/entrega/${request.entregaId}/validar-pin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            entregaId: request.entregaId,
            pin: request.pin,
            tipo: request.tipo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao validar PIN');
      }

      const data: ValidarPinResponseDTO = await response.json();
      setResultado(data);

      if (!data.validado) {
        setError(data.mensagem);
      }

      return data;
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao validar PIN';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    validarPin,
    loading,
    error,
    resultado,
  };
}

/**
 * Hook para gerar PIN codes.
 */
export function useGerarPin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gerarPin = useCallback(async (entregaId: string, tipo: TipoPinValidacao) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/entrega/${entregaId}/gerar-pin?tipo=${tipo}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar PIN');
      }

      const data = await response.json();
      return data.pin; // Retorna o PIN gerado
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao gerar PIN';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    gerarPin,
    loading,
    error,
  };
}
