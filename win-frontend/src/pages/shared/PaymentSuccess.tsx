import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Home } from "lucide-react";
import { api } from "@/lib/Api";

interface PaymentInfo {
  collection_id?: string;
  collection_status?: string;
  payment_id?: string;
  status?: string;
  external_reference?: string;
  payment_type?: string;
  merchant_order_id?: string;
  preference_id?: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({});

  useEffect(() => {
    // Extrair parâmetros da URL
    const params: PaymentInfo = {
      collection_id: searchParams.get("collection_id") || undefined,
      collection_status: searchParams.get("collection_status") || undefined,
      payment_id: searchParams.get("payment_id") || undefined,
      status: searchParams.get("status") || undefined,
      external_reference: searchParams.get("external_reference") || undefined,
      payment_type: searchParams.get("payment_type") || undefined,
      merchant_order_id: searchParams.get("merchant_order_id") || undefined,
      preference_id: searchParams.get("preference_id") || undefined,
    };

    setPaymentInfo(params);
    setLoading(false);

    // Opcional: Notificar o backend sobre o pagamento aprovado
    if (params.payment_id && params.external_reference) {
      api
        .patch(`/api/v1/pagamentos/${params.payment_id}/aprovar`)
        .catch((err) => console.error("Erro ao atualizar pagamento:", err));
    }
  }, [searchParams]);

  const pedidoId = searchParams.get("pedidoId") || paymentInfo.external_reference;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Ícone de Sucesso */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pagamento Aprovado!
            </h1>
            <p className="text-lg text-gray-600">
              Seu pedido foi confirmado com sucesso
            </p>
          </div>

          {/* Informações do Pagamento */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {paymentInfo.payment_id && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID do Pagamento</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {paymentInfo.payment_id}
                  </dd>
                </div>
              )}
              {pedidoId && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Número do Pedido</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {pedidoId}
                  </dd>
                </div>
              )}
              {paymentInfo.payment_type && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Forma de Pagamento</dt>
                  <dd className="mt-1 text-sm text-gray-900 uppercase">
                    {paymentInfo.payment_type === "credit_card"
                      ? "Cartão de Crédito"
                      : paymentInfo.payment_type === "debit_card"
                      ? "Cartão de Débito"
                      : paymentInfo.payment_type === "account_money"
                      ? "Saldo Mercado Pago"
                      : paymentInfo.payment_type}
                  </dd>
                </div>
              )}
              {paymentInfo.status && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {paymentInfo.status === "approved" ? "Aprovado" : paymentInfo.status}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Próximos Passos */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Próximos Passos
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Você receberá um e-mail com a confirmação do pedido e os detalhes de
                  entrega
                </span>
              </li>
              <li className="flex items-start">
                <Package className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Acompanhe o status do seu pedido na seção "Meus Pedidos"
                </span>
              </li>
              <li className="flex items-start">
                <Home className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Entraremos em contato caso necessário alguma informação adicional
                </span>
              </li>
            </ul>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4">
            {pedidoId && (
              <button
                onClick={() => navigate(`/orders/${pedidoId}`)}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Detalhes do Pedido
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
