import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { api } from "@/lib/Api";
import MercadoPagoWallet from "@/components/MercadoPagoWallet";
import {
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Lock,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface Address {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

const Checkout: React.FC = () => {
  const { state: cartState, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card" | "boleto">("credit_card");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  
  const [address, setAddress] = useState<Address>({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  });

  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    cpf: "",
  });

  const [pixData, setPixData] = useState({
    cpf: "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate("/cart");
    }
  }, [cartState.items, navigate]);

  const subtotal = cartState.total;
  const shipping = 15.0;
  const total = subtotal + shipping;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    setCardData({ ...cardData, number: value });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setCardData({ ...cardData, expiry: value });
  };

  const handleCepBlur = async () => {
    const cep = address.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setAddress({
            ...address,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            uf: data.uf || "",
          });
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showError("Erro", "Você precisa estar logado para finalizar a compra");
      navigate("/login");
      return;
    }

    // Validações
    if (!address.cep || !address.logradouro || !address.numero) {
      showError("Endereço incompleto", "Preencha todos os campos do endereço");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
        showError("Dados do cartão incompletos", "Preencha todos os campos do cartão");
        return;
      }
    }

    if (paymentMethod === "pix" && !pixData.cpf) {
      showError("CPF necessário", "Informe seu CPF para pagamento via PIX");
      return;
    }

    setLoading(true);

    try {
      // Preparar dados do pedido (SEM informações de pagamento - serão adicionadas depois)
      const pedidoData = {
        usuarioId: user.id,
        enderecoEntrega: {
          cep: address.cep,
          logradouro: address.logradouro,
          numero: address.numero,
          complemento: address.complemento || "",
          bairro: address.bairro,
          cidade: address.cidade,
          uf: address.uf,
        },
        desconto: 0.00,
        frete: parseFloat(shipping.toFixed(2)),
        itens: cartState.items.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantity,
          precoUnitario: parseFloat(item.price.toFixed(2)),
        })),
      };

      console.log("📦 Criando pedido com dados:", JSON.stringify(pedidoData, null, 2));

      // Criar pedido no backend
      const pedidoResponse = await api.post("/api/v1/pedidos", pedidoData);
      const pedido = pedidoResponse.data;
      
      console.log("✅ Pedido criado:", pedido);

      // Processar pagamento via Mercado Pago
      if (paymentMethod === "pix") {
        console.log("💳 Iniciando pagamento PIX para pedido:", pedido.id);
        console.log("📄 CPF:", pixData.cpf.replace(/\D/g, ""));
        console.log("📧 Email:", pixData.email);
        
        // Criar preferência de pagamento PIX
        const pixResponse = await api.post(
          `/api/v1/pagamentos/mercadopago/pix/${pedido.id}`,
          {
            cpf: pixData.cpf.replace(/\D/g, ""),
            email: pixData.email,
          }
        );

        console.log("✅ Resposta do backend PIX:", pixResponse.data);

        // Backend retorna a preferência de pagamento
        const { pix } = pixResponse.data;
        
        if (!pix || !pix.preferenceId) {
          console.error("❌ Resposta do backend não contém preferenceId:", pixResponse.data);
          throw new Error("Preferência de pagamento não foi criada corretamente");
        }
        
        console.log("🎫 Preference ID recebido:", pix.preferenceId);
        
        // Armazenar o preferenceId para renderizar o botão do Mercado Pago
        setPreferenceId(pix.preferenceId);
        setPedidoId(pedido.id);
        
        // Limpar carrinho
        clearCart();
        
        console.log("✅ Pedido finalizado, aguardando pagamento");
        success("Pedido criado! Clique no botão abaixo para pagar.");

      } else if (paymentMethod === "credit_card") {
        // Criar checkout de cartão
        const cartaoResponse = await api.post("/api/v1/pagamentos/mercadopago/cartao", null, {
          params: {
            pedidoId: pedido.id
          }
        });

        const checkoutUrl = cartaoResponse.data.checkoutUrl;
        
        success(
          "Redirecionando...",
          "Você será redirecionado para o Mercado Pago"
        );

        // Limpar carrinho
        clearCart();

        // Redirecionar para checkout do Mercado Pago
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1500);

      } else if (paymentMethod === "boleto") {
        // Processar pagamento tradicional
        const pagamentoData = {
          pedidoId: pedido.id,
          metodoPagamento: "BOLETO",
          valor: total,
          parcelas: null,
          informacoesCartao: null,
        };

        await api.post("/api/v1/pagamentos/processar", pagamentoData);

        success(
          "Pedido criado!",
          "O boleto foi enviado para seu e-mail. Realize o pagamento em até 3 dias úteis."
        );

        // Limpar carrinho
        clearCart();

        // Redirecionar
        setTimeout(() => {
          navigate(`/orders`);
        }, 2000);
      }

    } catch (err: any) {
      console.error("❌ ERRO COMPLETO:", err);
      console.error("❌ Resposta do servidor:", err.response);
      console.error("❌ Dados do erro:", err.response?.data);
      console.error("❌ Status:", err.response?.status);
      console.error("❌ URL da requisição:", err.config?.url);
      
      let errorMessage = "Não foi possível processar seu pagamento. Tente novamente.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError("Erro no pagamento", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/cart")}
            className="text-[#3DBEAB] hover:text-[#2D9CDB] font-semibold"
          >
            ← Voltar para o Carrinho
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulários */}
            <div className="lg:col-span-2 space-y-6">
              {/* Endereço de Entrega */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-[#3DBEAB]" />
                  Endereço de Entrega
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={address.cep}
                      onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rua/Avenida
                    </label>
                    <input
                      type="text"
                      value={address.logradouro}
                      onChange={(e) => setAddress({ ...address, logradouro: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={address.numero}
                      onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={address.complemento}
                      onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                      placeholder="Apto, Bloco, etc (opcional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={address.bairro}
                      onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={address.cidade}
                      onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UF
                    </label>
                    <input
                      type="text"
                      value={address.uf}
                      onChange={(e) => setAddress({ ...address, uf: e.target.value.toUpperCase() })}
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-[#3DBEAB]" />
                  Forma de Pagamento
                </h2>

                {/* Seleção do Método */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit_card")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "credit_card"
                        ? "border-[#3DBEAB] bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    <p className="text-sm font-medium text-center">Cartão de Crédito</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "pix"
                        ? "border-[#3DBEAB] bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mx-auto mb-2 text-center">💳</div>
                    <p className="text-sm font-medium text-center">PIX</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("boleto")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "boleto"
                        ? "border-[#3DBEAB] bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mx-auto mb-2 text-center">📄</div>
                    <p className="text-sm font-medium text-center">Boleto</p>
                  </button>
                </div>

                {/* Cartão de Crédito */}
                {paymentMethod === "credit_card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome no Cartão
                      </label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                        placeholder="NOME COMPLETO"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Validade
                        </label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CPF
                        </label>
                        <input
                          type="text"
                          value={cardData.cpf}
                          onChange={(e) => setCardData({ ...cardData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX */}
                {paymentMethod === "pix" && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-[#3DBEAB] rounded-xl p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-[#3DBEAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            ⚡ Pagamento Instantâneo com PIX
                          </h3>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Aprovação em segundos
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              QR Code gerado automaticamente
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Pagamento 100% seguro
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Válido por 30 minutos
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF do Pagador
                      </label>
                      <input
                        type="text"
                        value={pixData.cpf}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 11) {
                            value = value.replace(/(\d{3})(\d)/, "$1.$2");
                            value = value.replace(/(\d{3})(\d)/, "$1.$2");
                            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                          }
                          setPixData({ ...pixData, cpf: value });
                        }}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail para Notificações
                      </label>
                      <input
                        type="email"
                        value={pixData.email}
                        onChange={(e) => setPixData({ ...pixData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Você receberá a confirmação do pagamento neste e-mail
                      </p>
                    </div>
                  </div>
                )}

                {/* Boleto */}
                {paymentMethod === "boleto" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Atenção:</strong> O boleto bancário será enviado para seu e-mail e
                      pode levar até 3 dias úteis para compensação. O pedido será processado
                      após a confirmação do pagamento.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo</h2>

                {/* Itens */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totais */}
                <div className="space-y-2 border-t pt-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete</span>
                    <span>R$ {shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-[#3DBEAB]">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botão Finalizar */}
                <button
                  type="submit"
                  disabled={loading || preferenceId !== null}
                  className="w-full py-3 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Processando...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Finalizar Pedido</span>
                    </>
                  )}
                </button>

                {/* Botão de Pagamento do Mercado Pago */}
                {preferenceId && paymentMethod === "pix" && (
                  <div className="mt-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            Pedido Criado com Sucesso!
                          </h4>
                          <p className="text-sm text-gray-600">
                            Clique no botão abaixo para ser redirecionado ao Mercado Pago e finalizar o pagamento.
                          </p>
                          {pedidoId && (
                            <p className="text-xs text-gray-500 mt-2">
                              Pedido: {pedidoId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <MercadoPagoWallet 
                      preferenceId={preferenceId}
                      onError={(error) => {
                        console.error("Erro no Wallet:", error);
                        showError("Erro ao carregar botão de pagamento. Tente novamente.");
                      }}
                    />
                  </div>
                )}

                {/* Selos de Segurança */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-3">
                    <Lock className="w-4 h-4" />
                    <span>Pagamento 100% Seguro</span>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src="https://via.placeholder.com/60x40/e0e0e0/666666?text=Visa"
                      alt="Visa"
                      className="h-8 grayscale opacity-60"
                    />
                    <img
                      src="https://via.placeholder.com/60x40/e0e0e0/666666?text=MC"
                      alt="Mastercard"
                      className="h-8 grayscale opacity-60"
                    />
                    <img
                      src="https://via.placeholder.com/60x40/e0e0e0/666666?text=PIX"
                      alt="PIX"
                      className="h-8 grayscale opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
