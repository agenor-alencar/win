import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, Truck, MapPin, Calendar } from "lucide-react";

interface OrderDetails {
  id: string;
  numeroPedido: string;
  status: string;
  total: number;
  criadoEm: string;
  enderecoEntrega: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  itens: Array<{
    id: string;
    quantidade: number;
    precoUnitario: number;
    produto: {
      nome: string;
      imagemPrincipal: string;
    };
  }>;
}

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/v1/pedidos/${orderId}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DBEAB]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Realizado com Sucesso!
          </h1>
          <p className="text-gray-600">
            Seu pedido #{order?.numeroPedido} foi confirmado
          </p>
        </div>

        {/* Detalhes do Pedido */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Detalhes do Pedido
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Número do Pedido</p>
                    <p className="font-semibold text-gray-900">
                      {order.numeroPedido}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Data do Pedido</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-[#3DBEAB]">
                      {order.status}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Endereço de Entrega</p>
                    <p className="font-semibold text-gray-900">
                      {order.enderecoEntrega.logradouro}, {order.enderecoEntrega.numero}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.enderecoEntrega.bairro} - {order.enderecoEntrega.cidade}/{order.enderecoEntrega.uf}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Itens */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
              <div className="space-y-3">
                {order.itens.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.produto.imagemPrincipal}
                      alt={item.produto.nome}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.produto.nome}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantidade}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#3DBEAB]">
                  R$ {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow font-semibold text-center"
          >
            Continuar Comprando
          </Link>
          <Link
            to="/track"
            className="px-6 py-3 border-2 border-[#3DBEAB] text-[#3DBEAB] rounded-lg hover:bg-teal-50 transition-colors font-semibold text-center"
          >
            Rastrear Pedido
          </Link>
        </div>

        {/* Informação Adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            📧 Um e-mail de confirmação foi enviado para você com todos os
            detalhes do pedido.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
