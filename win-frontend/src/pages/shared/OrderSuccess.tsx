import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, Package, Truck, MapPin, Calendar, 
  CreditCard, FileText, ArrowLeft, Download, 
  Clock, XCircle, AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import { ordersApi } from "@/lib/api/ordersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderDetails {
  id: string;
  numeroPedido: string;
  status: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  criadoEm: string;
  confirmadoEm?: string;
  entregueEm?: string;
  enderecoEntrega?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  pagamento?: {
    formaPagamento: string;
    status: string;
  };
  itens: Array<{
    id: string;
    produtoNome: string;
    produtoImagem: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  }>;
  notaFiscal?: {
    numeroNota: string;
    urlPdf: string;
  };
}

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 mb-1">
                    Aguardando confirmação de pagamento
                  </p>
                  <p className="text-sm text-yellow-800">
                    Assim que confirmarmos o pagamento, iniciaremos o processamento do seu pedido.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
