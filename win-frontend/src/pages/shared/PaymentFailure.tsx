import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, Home, CreditCard } from "lucide-react";

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

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({});

  useEffect(() => {
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
  }, [searchParams]);

  const pedidoId = searchParams.get("pedidoId") || paymentInfo.external_reference;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Ícone de Erro */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pagamento Recusado
            </h1>
            <p className="text-lg text-gray-600">
              Não foi possível processar seu pagamento
            </p>
          </div>

          {/* Informações do Pagamento */}
          {paymentInfo.payment_id && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID da Transação</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {paymentInfo.payment_id}
                  </dd>
                </div>
                {pedidoId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Número do Pedido</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">
                      {pedidoId}
                    </dd>
                  </div>
                )}
                {paymentInfo.status && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {paymentInfo.status === "rejected"
                          ? "Rejeitado"
                          : paymentInfo.status === "cancelled"
                          ? "Cancelado"
                          : paymentInfo.status}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Motivos Possíveis */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              Possíveis Motivos
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Saldo ou limite insuficiente</span>
              </li>
              <li className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Dados do cartão incorretos</span>
              </li>
              <li className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Problema com a operadora do cartão</span>
              </li>
              <li className="flex items-start">
                <CreditCard className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>Pagamento cancelado pelo usuário</span>
              </li>
            </ul>
          </div>

          {/* O que fazer */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              O que você pode fazer?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Verificar os dados do seu cartão</li>
              <li>✓ Tentar com outro cartão</li>
              <li>✓ Escolher outra forma de pagamento</li>
              <li>✓ Entrar em contato com seu banco</li>
            </ul>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tentar Novamente
            </button>
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

export default PaymentFailure;
