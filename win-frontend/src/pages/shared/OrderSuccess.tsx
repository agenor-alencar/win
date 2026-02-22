import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, Package, Truck, MapPin, Calendar, 
  CreditCard, FileText, ArrowLeft, Download, 
  Clock, XCircle, AlertCircle, Loader2
} from "lucide-react";
import Header from "@/components/Header";
import { ordersApi, Order } from "@/lib/api/ordersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/Api";

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess, warning: showWarning } = useNotification();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  // Configuração de status
  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDENTE: {
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Clock className="h-4 w-4" />,
    },
    PROCESSANDO: {
      label: "Em Processamento",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <Package className="h-4 w-4" />,
    },
    ENVIADO: {
      label: "Em Transporte",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: <Truck className="h-4 w-4" />,
    },
    ENTREGUE: {
      label: "Entregue",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    CANCELADO: {
      label: "Cancelado",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("ID do pedido não fornecido");
        setLoading(false);
        return;
      }

      try {
        const data = await ordersApi.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
        setError("Não foi possível carregar os detalhes do pedido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleEfetuarPagamento = async () => {
    if (!order?.id) return;
    
    console.log("🔵 Iniciando processo de pagamento para pedido:", order.id);
    console.log("🔵 Forma de pagamento:", order.pagamento?.formaPagamento);
    
    setProcessandoPagamento(true);
    
    try {
      // Verifica se é pagamento PIX
      if (order.pagamento?.formaPagamento?.toUpperCase().includes("PIX")) {
        console.log("✅ Pagamento identificado como PIX");
        
        // Prepara dados do cliente para validação
        const dadosCliente = {
          nome: user?.nome || "Cliente",
          email: user?.email || "",
          cpf: "", // CPF não está disponível no contexto, mas backend pode buscar do pedido
          telefone: user?.telefone || ""
        };

        console.log("📤 Chamando endpoint de validação e recriação de PIX...");
        console.log("📤 Dados do cliente:", dadosCliente);

        // Chama novo endpoint que valida produtos e recria PIX se necessário
        const response = await api.post(
          `/v1/pagamentos/pedido/${order.id}/pix/obter-ou-recriar`,
          dadosCliente
        );
        
        console.log("✅ Resposta do backend:", response.data);
        
        if (response.data?.success) {
          const avisos = response.data.avisos || [];
          
          // Verifica se há produtos indisponíveis
          const produtosIndisponiveis = avisos.filter(
            (aviso: any) => aviso.tipo === "PRODUTO_INDISPONIVEL"
          );
          
          if (produtosIndisponiveis.length > 0) {
            // Bloqueia pagamento se produtos não estão disponíveis
            const mensagens = produtosIndisponiveis
              .map((aviso: any) => `- ${aviso.produtoNome}: ${aviso.mensagem}`)
              .join("\n");
            
            showError(
              "Produtos Indisponíveis",
              `Os seguintes produtos não estão mais disponíveis:\n${mensagens}`
            );
            return;
          }
          
          // Exibe avisos sobre alterações de preço/estoque (não bloqueantes)
          const alteracoes = avisos.filter(
            (aviso: any) => aviso.tipo === "PRECO_ALTERADO" || aviso.tipo === "ESTOQUE_ALTERADO"
          );
          
          if (alteracoes.length > 0) {
            const mensagens = alteracoes
              .map((aviso: any) => `${aviso.produtoNome}: ${aviso.mensagem}`)
              .join("\n");
            
            showWarning(
              "Alterações nos Produtos",
              `Alguns produtos tiveram alterações:\n${mensagens}\n\nVocê pode prosseguir com o pagamento.`
            );
            
            console.log("⚠️ Avisos exibidos ao usuário");
            // Pequeno delay para o usuário ler o aviso
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          // Redireciona para a página de pagamento PIX
          console.log("🔄 Redirecionando para /pagamento/pix/" + order.id);
          navigate(`/pagamento/pix/${order.id}`);
          console.log("✅ Navigate executado");
        }
      } else {
        console.log("ℹ️ Não é pagamento PIX, redirecionando para checkout");
        // Para outros métodos, redireciona para checkout
        navigate(`/checkout`);
      }
    } catch (error: any) {
      console.error("❌ Erro ao processar pagamento:", error);
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Dados:", error.response?.data);
      
      // Tratamento específico de erros
      if (error.response?.status === 404) {
        showError(
          "Pedido não encontrado",
          "O pedido não foi encontrado no sistema."
        );
      } else if (error.response?.data?.error === "PRODUTOS_INDISPONIVEIS") {
        showError(
          "Produtos Indisponíveis",
          error.response.data.message || "Alguns produtos não estão mais disponíveis."
        );
      } else {
        showError(
          "Erro ao Processar Pagamento",
          error.response?.data?.message || "Não foi possível processar o pagamento. Tente novamente."
        );
      }
    } finally {
      console.log("🏁 Finalizando processo de pagamento");
      setProcessandoPagamento(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DBEAB] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Pedido não encontrado
              </h2>
              <p className="text-gray-600 mb-6">
                {error || "Não foi possível encontrar este pedido"}
              </p>
              <Button onClick={() => navigate("/orders")} className="w-full">
                Voltar para Meus Pedidos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.PENDENTE;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Meus Pedidos
          </Button>

          {/* Cabeçalho do Pedido */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pedido #{order.numeroPedido}
                </h1>
                <p className="text-gray-600">
                  Realizado em {new Date(order.criadoEm).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              <Badge className={`${statusInfo.color} border px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit`}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Itens e Detalhes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Itens do Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.itens.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <img
                          src={item.produtoImagem || "/placeholder.svg"}
                          alt={item.produtoNome}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.produtoNome}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Quantidade: {item.quantidade}
                          </p>
                          <p className="text-sm text-gray-600">
                            R$ {item.precoUnitario.toFixed(2)} x {item.quantidade}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R$ {item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              {order.enderecoEntrega && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700">
                      <p className="font-medium">
                        {order.enderecoEntrega.logradouro}, {order.enderecoEntrega.numero}
                      </p>
                      {order.enderecoEntrega.complemento && (
                        <p className="text-sm text-gray-600">
                          {order.enderecoEntrega.complemento}
                        </p>
                      )}
                      <p className="text-sm">
                        {order.enderecoEntrega.bairro}
                      </p>
                      <p className="text-sm">
                        {order.enderecoEntrega.cidade} - {order.enderecoEntrega.estado}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        CEP: {order.enderecoEntrega.cep}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline do Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Histórico do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        {(order.confirmadoEm || order.entregueEm) && (
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Pedido Criado</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.criadoEm).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {order.confirmadoEm && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          {order.entregueEm && (
                            <div className="w-0.5 h-8 bg-gray-300"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-900">Pedido Confirmado</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.confirmadoEm).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.entregueEm && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Pedido Entregue</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.entregueEm).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Resumo e Pagamento */}
            <div className="space-y-6">
              {/* Resumo do Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>R$ {order.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-700">
                      <span>Frete</span>
                      <span>
                        {order.frete === 0 ? (
                          <span className="text-green-600 font-medium">Grátis</span>
                        ) : (
                          `R$ ${order.frete.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    {order.desconto > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto</span>
                        <span>- R$ {order.desconto.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#3DBEAB]">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forma de Pagamento */}
              {order.pagamento && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Forma de Pagamento</span>
                        <span className="font-medium text-gray-900">
                          {order.pagamento.formaPagamento}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge variant={
                          order.pagamento.status === "APROVADO" ? "default" : "secondary"
                        }>
                          {order.pagamento.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nota Fiscal */}
              {order.notaFiscal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Nota Fiscal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Nota Fiscal Nº {order.notaFiscal.numeroNota}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(order.notaFiscal?.urlPdf, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB]"
                >
                  Continuar Comprando
                </Button>
                
                {order.status === "ENVIADO" && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/track")}
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Rastrear Pedido
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Informação Adicional */}
          {order.status === "PENDENTE" && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex gap-3 flex-1">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 mb-1">
                      Aguardando confirmação de pagamento
                    </p>
                    <p className="text-sm text-yellow-800">
                      {order.pagamento?.status === "APROVADO" 
                        ? "Seu pagamento foi aprovado e estamos processando seu pedido."
                        : "Finalize o pagamento para iniciarmos o processamento do seu pedido."}
                    </p>
                  </div>
                </div>
                {order.pagamento?.status !== "APROVADO" && (
                  <Button
                    onClick={handleEfetuarPagamento}
                    disabled={processandoPagamento}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white whitespace-nowrap shadow-sm disabled:opacity-50"
                  >
                    {processandoPagamento ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Efetuar Pagamento
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
