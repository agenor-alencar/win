import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import { MerchantLayout } from "@/components/MerchantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/Api";
import { useNotification } from "@/contexts/NotificationContext";

interface OrderItem {
  id: string;
  produtoId?: string;
  produtoNome?: string;
  produtoImagem?: string;
  variacaoProdutoNome?: string;
  quantidade: number;
  precoUnitario?: number;
  subtotal: number;
  observacoes?: string;
}

interface OrderAddress {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  estado?: string;
}

interface OrderPayment {
  metodoPagamento?: string;
  valor?: number;
  parcelas?: number;
  informacoesCartao?: string;
  transacaoId?: string;
  status?: string;
}

interface OrderDetails {
  id: string;
  numeroPedido: string;
  usuarioId?: string;
  usuarioNome?: string;
  lojistaNome?: string;
  motoristaNome?: string;
  status: string;
  subtotal?: number;
  desconto?: number;
  frete?: number;
  total: number;
  enderecoEntrega?: OrderAddress;
  pagamento?: OrderPayment;
  codigoEntrega?: string;
  criadoEm?: string;
  confirmadoEm?: string;
  entregueEm?: string;
  itens: OrderItem[];
}

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value || 0),
  );

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
};

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDENTE: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMADO: {
    label: "Confirmado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PREPARANDO: {
    label: "Em Preparo",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  PRONTO: {
    label: "Pronto",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  EM_TRANSITO: {
    label: "Em Trânsito",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  ENTREGUE: {
    label: "Entregue",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export default function MerchantOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const { data } = await api.get<OrderDetails>(`/v1/pedidos/${orderId}`);
      setOrder(data);
    } catch (error: any) {
      notifyError(
        "Erro",
        error.response?.data?.message || "Não foi possível carregar os detalhes do pedido",
      );
    } finally {
      setLoading(false);
    }
  }, [notifyError, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const status = (order?.status || "PENDENTE").toUpperCase();
  const statusInfo = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const itemCount = useMemo(
    () => (order?.itens || []).reduce((acc, item) => acc + Number(item.quantidade || 0), 0),
    [order],
  );

  const executeStatusAction = async (action: "confirmar" | "preparando" | "pronto") => {
    if (!order) return;
    try {
      await api.patch(`/v1/pedidos/${order.id}/${action}`);
      success("Status atualizado", "Pedido atualizado com sucesso.");
      await loadOrder();
    } catch (error: any) {
      notifyError(
        "Erro",
        error.response?.data?.message || "Não foi possível atualizar o status do pedido",
      );
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Clock3 className="h-6 w-6 animate-spin text-[#3DBEAB]" />
          <span className="ml-2 text-gray-700">Carregando pedido...</span>
        </div>
      </MerchantLayout>
    );
  }

  if (!order) {
    return (
      <MerchantLayout>
        <div className="max-w-xl mx-auto py-12">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-gray-700 font-medium">Pedido não encontrado</p>
              <Button onClick={() => navigate("/merchant/orders")} className="rounded-xl">
                Voltar para Pedidos
              </Button>
            </CardContent>
          </Card>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate("/merchant/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Pedidos
          </Button>

          <Button variant="outline" className="rounded-xl" onClick={loadOrder}>
            Atualizar
          </Button>
        </div>

        <Card className="rounded-xl border border-gray-200">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.numeroPedido}</h1>
              <p className="text-sm text-gray-600">
                Criado em {formatDateTime(order.criadoEm)} • {itemCount} item(ns)
              </p>
              <p className="text-sm text-gray-600">Loja: {order.lojistaNome || "-"}</p>
            </div>
            <Badge className={`${statusInfo.className} border px-3 py-1 text-sm`}>{statusInfo.label}</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card className="rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(order.itens || []).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 flex gap-3">
                    <img
                      src={item.produtoImagem || "/placeholder.svg"}
                      alt={item.produtoNome || "Produto"}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.produtoNome || "Item sem nome"}</p>
                      {item.variacaoProdutoNome && (
                        <p className="text-xs text-gray-500">Variação: {item.variacaoProdutoNome}</p>
                      )}
                      <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                      <p className="text-sm text-gray-600">
                        Unitário: {formatCurrency(item.precoUnitario)}
                      </p>
                      {item.observacoes && (
                        <p className="text-xs text-gray-500 mt-1">Obs: {item.observacoes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {order.enderecoEntrega && (
              <Card className="rounded-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-1">
                  <p>
                    {order.enderecoEntrega.logradouro}, {order.enderecoEntrega.numero}
                  </p>
                  {order.enderecoEntrega.complemento && <p>{order.enderecoEntrega.complemento}</p>}
                  <p>
                    {order.enderecoEntrega.bairro} • {order.enderecoEntrega.cidade} - {order.enderecoEntrega.uf || order.enderecoEntrega.estado}
                  </p>
                  <p>CEP: {order.enderecoEntrega.cep}</p>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Criado em {formatDateTime(order.criadoEm)}</span>
                </div>
                {order.confirmadoEm && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span>Confirmado em {formatDateTime(order.confirmadoEm)}</span>
                  </div>
                )}
                {order.entregueEm && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-purple-600" />
                    <span>Entregue em {formatDateTime(order.entregueEm)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-gray-900">{order.usuarioNome || "Cliente não identificado"}</p>
                <p>ID: {order.usuarioId || "-"}</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Método: {order.pagamento?.metodoPagamento || "-"}</p>
                <p>Status: {order.pagamento?.status || "-"}</p>
                {order.pagamento?.parcelas && <p>Parcelas: {order.pagamento.parcelas}x</p>}
                {order.pagamento?.transacaoId && <p>Transação: {order.pagamento.transacaoId}</p>}
                {order.codigoEntrega && <p>Código de entrega: {order.codigoEntrega}</p>}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Frete</span><span>{formatCurrency(order.frete)}</span></div>
                <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(order.desconto)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-[#3DBEAB] text-base">
                  <span>Total</span><span>{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardHeader>
                <CardTitle>Ações Operacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {status === "PENDENTE" && (
                  <Button className="w-full rounded-xl" onClick={() => executeStatusAction("confirmar")}>
                    Confirmar Pedido
                  </Button>
                )}
                {status === "CONFIRMADO" && (
                  <Button className="w-full rounded-xl" onClick={() => executeStatusAction("preparando")}>
                    Iniciar Preparo
                  </Button>
                )}
                {status === "PREPARANDO" && (
                  <Button className="w-full rounded-xl" onClick={() => executeStatusAction("pronto")}>
                    Marcar como Pronto
                  </Button>
                )}
                {!["PENDENTE", "CONFIRMADO", "PREPARANDO"].includes(status) && (
                  <p className="text-sm text-gray-600">Sem ações disponíveis para este status.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
