import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Copy, Clock, AlertCircle, ArrowLeft, Shield, Loader2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { api } from "@/lib/Api";

interface PaymentData {
  billing: {
    qrCode: string;
    qrCodeUrl: string;
    billingId: string;
    amount: number;
  };
  pedido: {
    id: string;
    total: number;
    status: string;
  };
}

const PaymentPix: React.FC = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Buscar dados do pagamento
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/v1/pagamentos/pedido/${pedidoId}/pix`);
        setPaymentData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dados do pagamento:", err);
        error("Erro", "Não foi possível carregar os dados do pagamento");
        setLoading(false);
        setTimeout(() => navigate("/orders"), 2000);
      }
    };

    if (pedidoId) {
      fetchPaymentData();
    } else {
      error("Erro", "Pedido não encontrado");
      navigate("/");
    }
  }, [pedidoId, navigate, error]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!paymentData?.billing?.billingId) return;

    const checkPaymentStatus = async () => {
      try {
        setCheckingPayment(true);
        const response = await api.get(`/v1/pagamentos/${paymentData.billing.billingId}/status`);
        const { status } = response.data;
        
        console.log("📊 Status do pagamento:", status);
        
        if (status === "paid" || status === "aprovado" || status === "approved") {
          success("💰 Pagamento confirmado!", "Redirecionando para detalhes do pedido...");
          setTimeout(() => {
            navigate(`/orders/${pedidoId}`);
          }, 2000);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      } finally {
        setCheckingPayment(false);
      }
    };

    // Verificar imediatamente
    checkPaymentStatus();

    // Polling a cada 5 segundos
    const pollingInterval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(pollingInterval);
  }, [paymentData, pedidoId, navigate, success]);

  // Timer de expiração
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    if (paymentData?.billing?.qrCode) {
      navigator.clipboard.writeText(paymentData.billing.qrCode);
      setCopied(true);
      success("✅ Código copiado!", "Cole no app do seu banco para pagar");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#3DBEAB] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando dados do pagamento...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center text-gray-600 hover:text-[#3DBEAB] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Ver meus pedidos
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Coluna Direita - Informações (no mobile aparece primeiro) */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Resumo + Tempo */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Resumo do Pagamento
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b">
                  <span className="text-gray-600 text-sm sm:text-base">Pedido</span>
                  <span className="font-mono font-medium text-sm sm:text-base">#{pedidoId?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center text-xl sm:text-2xl font-bold text-[#3DBEAB]">
                  <span>Total</span>
                  <span>R$ {((paymentData.billing.amount || paymentData.pedido.total) / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2">
                <Clock className={`w-5 h-5 ${timeLeft < 300 ? "text-red-500" : "text-gray-500"}`} />
                <span className={`font-mono text-lg font-semibold ${timeLeft < 300 ? "text-red-500" : "text-gray-700"}`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-gray-500">restantes</span>
              </div>

              {timeLeft < 300 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 sm:mt-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      Atenção! O código PIX expira em breve. Complete o pagamento o quanto antes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Código Copia e Cola */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Copy className="w-5 h-5 mr-2 text-[#3DBEAB]" />
                Código Copia e Cola
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-gray-200">
                  <code className="text-[11px] sm:text-xs font-mono text-gray-700 break-all block max-h-20 sm:max-h-24 overflow-y-auto">
                    {paymentData.billing.qrCode}
                  </code>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={handleCopyCode}
                    className={`w-full py-3 rounded-lg font-semibold transition-all transform active:scale-95 ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white hover:shadow-lg"
                    }`}
                  >
                    {copied ? (
                      <span className="flex items-center justify-center text-sm sm:text-base">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Código Copiado!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center text-sm sm:text-base">
                        <Copy className="w-5 h-5 mr-2" />
                        Copiar Código PIX
                      </span>
                    )}
                  </button>
                  <a
                    href="#pix-qr-section"
                    className="w-full py-3 px-4 rounded-lg font-semibold border border-gray-200 text-gray-700 text-center hover:bg-gray-50 transition-colors"
                  >
                    Ver QR Code
                  </a>
                </div>
              </div>
            </div>

            {/* Instruções Desktop */}
            <div className="hidden lg:block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border-2 border-blue-100">
              <h3 className="font-bold text-blue-900 mb-4 text-lg flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Como pagar com PIX
              </h3>
              <ol className="space-y-3">
                {[
                  "Abra o aplicativo do seu banco",
                  "Escolha a opção Pagar com PIX",
                  "Escaneie o QR Code ou cole o código",
                  "Confirme as informações e finalize"
                ].map((step, index) => (
                  <li key={index} className="flex items-start text-blue-900">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Instruções Mobile (compactas) */}
            <details className="lg:hidden bg-white rounded-2xl shadow-lg p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">Como pagar com PIX</summary>
              <ol className="space-y-2 mt-3">
                {[
                  "Abra o app do seu banco",
                  "Pagar com PIX",
                  "Escaneie ou cole o código",
                  "Confirme e finalize"
                ].map((step, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </details>

            {/* Segurança */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-green-100">
              <div className="flex items-center justify-center gap-3 text-green-700">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                <div className="text-center">
                  <p className="font-semibold text-sm sm:text-base">Pagamento 100% Seguro</p>
                  <p className="text-xs sm:text-sm text-gray-600">Protegido pela Pagar.me</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Esquerda - QR Code */}
          <div id="pix-qr-section" className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Card QR Code */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#3DBEAB] to-[#2D9CDB] rounded-full mb-3 sm:mb-4">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Pagamento via PIX
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Escaneie o QR Code para pagar
                </p>
              </div>

              {/* QR Code Display */}
              {paymentData.billing.qrCodeUrl ? (
                <div className="bg-white p-3 sm:p-4 rounded-xl border-4 border-[#3DBEAB] mb-2 sm:mb-6 relative max-w-[300px] sm:max-w-[420px] mx-auto">
                  <img
                    src={paymentData.billing.qrCodeUrl}
                    alt="QR Code PIX"
                    className="w-full h-auto"
                  />
                  {checkingPayment && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Verificando...
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 p-6 sm:p-8 rounded-xl mb-2 sm:mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-48 h-48 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nota de rodapé */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 px-2">
          <p>Após a confirmação do pagamento, você receberá um e-mail com os detalhes do seu pedido.</p>
          <p className="mt-1 hidden sm:block">O prazo de entrega começará a contar após a aprovação do pagamento.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPix;
