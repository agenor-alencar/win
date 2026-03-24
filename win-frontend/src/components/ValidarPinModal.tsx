import React, { useState, useCallback, useEffect } from 'react';
import { usePinValidacao } from '../hooks/usePinValidacao';
import { TipoPinValidacao } from '../types/entrega';
import { Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ValidarPinModalProps {
  entregaId: string;
  tipo: TipoPinValidacao;
  isOpen: boolean;
  onClose: () => void;
  onValidadoComSucesso?: (dataValidacao: string) => void;
}

/**
 * Modal para validação de PIN code.
 * 
 * Exibe:
 * - Campo de input para PIN
 * - Tentativas restantes
 * - Status de bloqueio (brute force)
 * - Mensagens de sucesso/erro
 */
export function ValidarPinModal({
  entregaId,
  tipo,
  isOpen,
  onClose,
  onValidadoComSucesso,
}: ValidarPinModalProps) {
  const [pin, setPin] = useState('');
  const { validarPin, loading, error, resultado } = usePinValidacao();
  const [mensagemTempo, setMensagemTempo] = useState<string | null>(null);

  const handleValidar = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length < 4) {
      setMensagemTempo('PIN deve ter pelo menos 4 dígitos');
      return;
    }

    try {
      const resultado = await validarPin({
        entregaId,
        pin,
        tipo,
      });

      if (resultado.validado) {
        setMensagemTempo('✅ PIN validado com sucesso!');
        setPin('');
        
        // Aguardar 2 segundos e fechar modal
        setTimeout(() => {
          onValidadoComSucesso?.(resultado.dataValidacao || new Date().toISOString());
          onClose();
        }, 2000);
      }
    } catch (err) {
      setMensagemTempo('Erro ao validar PIN, tente novamente');
    }
  }, [pin, entregaId, tipo, validarPin, onClose, onValidadoComSucesso]);

  // Reset mensagem de tempo após 5 segundos
  useEffect(() => {
    if (mensagemTempo) {
      const timer = setTimeout(() => setMensagemTempo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagemTempo]);

  if (!isOpen) return null;

  const estaBloqueado = resultado?.bloqueado ?? false;
  const tentativasRestantes = resultado?.tentativasRestantes ?? 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">
            {tipo === 'COLETA' ? 'Confirmar Coleta' : 'Confirmar Entrega'}
          </h2>
        </div>

        {/* Instrução */}
        <p className="text-gray-600 mb-4">
          Digite o código PIN de 4 dígitos enviado via SMS.
        </p>

        {/* Status Bloqueio */}
        {estaBloqueado && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Muitas tentativas</p>
              <p className="text-sm text-red-700">
                {resultado?.mensagem || 'Tente novamente em 15 minutos'}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleValidar} className="space-y-4">
          {/* Input PIN */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, '');
                setPin(valor);
              }}
              placeholder="0000"
              disabled={loading || estaBloqueado}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-mono disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tentativas Restantes */}
          {!estaBloqueado && resultado && tentativasRestantes > 0 && (
            <p className="text-sm text-amber-600 text-center">
              {tentativasRestantes} tentativa(s) restante(s)
            </p>
          )}

          {/* Mensagem de Erro */}
          {error && !estaBloqueado && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Mensagem de Tempo */}
          {mensagemTempo && (
            <div className={`rounded-lg p-3 text-center font-semibold ${
              mensagemTempo.startsWith('✅')
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {mensagemTempo}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || pin.length < 4 || estaBloqueado}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Validando...' : 'Validar'}
            </button>
          </div>
        </form>

        {/* Status de Sucesso */}
        {resultado?.validado && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">PIN Validado!</p>
              <p className="text-sm text-green-700">{resultado.mensagem}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidarPinModal;
