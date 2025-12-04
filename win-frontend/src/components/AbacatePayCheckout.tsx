import React, { useState } from "react";
import { ExternalLink, CreditCard } from "lucide-react";

interface AbacatePayCheckoutProps {
  checkoutUrl: string;
  billingId: string;
  amount: number;
  onReady?: () => void;
  onError?: (error: any) => void;
}

const AbacatePayCheckout: React.FC<AbacatePayCheckoutProps> = ({ 
  checkoutUrl, 
  billingId,
  amount,
  onReady,
  onError 
}) => {
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (checkoutUrl && onReady) {
      onReady();
    }
  }, [checkoutUrl, onReady]);

  const handlePayment = () => {
    try {
      setLoading(true);
      // Redirecionar para página de checkout do Abacate Pay
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Erro ao redirecionar para pagamento:", error);
      if (onError) {
        onError(error);
      }
      setLoading(false);
    }
  };

  if (!checkoutUrl) {
    return (
      <div className="text-center text-gray-500 py-4">
        Carregando dados de pagamento...
      </div>
    );
  }

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount / 100);

  return (
    <div className="abacatepay-checkout-container w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Informações do Pagamento */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {valorFormatado}
          </h3>
          <p className="text-sm text-gray-500">
            ID da Cobrança: {billingId.substring(0, 20)}...
          </p>
        </div>

        {/* Métodos de Pagamento */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PIX</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Pagar com PIX</p>
                  <p className="text-xs text-gray-500">Pagamento instantâneo</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Botão de Pagamento */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Redirecionando...</span>
          ) : (
            <>
              <span>Ir para o Pagamento</span>
              <ExternalLink className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Informações Adicionais */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>
              Pagamento processado de forma segura pela <strong>Abacate Pay</strong>. 
              Você será redirecionado para completar a transação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbacatePayCheckout;
