import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { storeApi, type Store } from "@/lib/admin";
import { useNotification } from "@/contexts/NotificationContext";
import { api } from "@/lib/Api";

interface LojistaEstatisticas {
  vendasHoje: number;
  vendasOntem: number;
  receitaHoje: number;
  receitaOntem: number;
  totalPedidosPendentes: number;
  totalProdutosAtivos: number;
  totalProdutosInativos: number;
  percentualVariacaoVendas: number;
  percentualVariacaoReceita: number;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  imagemUrl?: string;
}

const AdminStoreDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<LojistaEstatisticas | null>(null);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadStoreDetails();
    }
  }, [id]);

  const loadStoreDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const [storeData, statsData, productsData] = await Promise.all([
        storeApi.getStoreById(id),
        fetchStoreStats(id),
        fetchStoreProducts(id),
      ]);

      setStore(storeData);
      setStats(statsData);
      setProducts(productsData);
    } catch (err: any) {
      console.error("Erro ao carregar detalhes da loja:", err);
      error(err.message || "Erro ao carregar detalhes da loja");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreStats = async (lojistaId: string): Promise<LojistaEstatisticas> => {
    try {
      const response = await api.get<LojistaEstatisticas>(
        `/v1/lojistas/${lojistaId}/estatisticas`
      );
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      return {
        vendasHoje: 0,
        vendasOntem: 0,
        receitaHoje: 0,
        receitaOntem: 0,
        totalPedidosPendentes: 0,
        totalProdutosAtivos: 0,
        totalProdutosInativos: 0,
        percentualVariacaoVendas: 0,
        percentualVariacaoReceita: 0,
      };
    }
  };

  const fetchStoreProducts = async (lojistaId: string): Promise<Produto[]> => {
    try {
      const response = await api.get<Produto[]>(`/v1/produtos/lojista/${lojistaId}`);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      return [];
    }
  };

  const handleToggleStatus = async () => {
    if (!store) return;

    try {
      setActionLoading(true);
      
      if (store.ativo) {
        await storeApi.deactivateStore(store.id);
        success("Loja suspensa com sucesso");
      } else {
        await storeApi.activateStore(store.id);
        success("Loja ativada com sucesso");
      }

      await loadStoreDetails();
    } catch (err: any) {
      console.error("Erro ao alterar status:", err);
      error(err.message || "Erro ao alterar status da loja");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-[#3DBEAB]" />
        </div>
      </AdminLayout>
    );
  }

  if (!store) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Loja não encontrada</p>
          <button
            onClick={() => navigate("/admin/stores")}
            className="mt-4 text-[#3DBEAB] hover:underline"
          >
            Voltar para lista de lojas
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/stores")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">
                {store.nomeFantasia}
              </h1>
              <p className="text-gray-600">
                Detalhes completos da loja
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadStoreDetails}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                store.ativo
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {store.ativo ? (
                <>
                  <XCircleIcon className="w-4 h-4" />
                  <span>Suspender Loja</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Ativar Loja</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              store.ativo
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {store.ativo ? "Ativa" : "Suspensa"}
          </span>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vendas Hoje</p>
                  <p className="text-2xl font-semibold text-[#111827]">
                    {stats.vendasHoje}
                  </p>
                  {stats.percentualVariacaoVendas !== 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        stats.percentualVariacaoVendas > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.percentualVariacaoVendas > 0 ? "+" : ""}
                      {stats.percentualVariacaoVendas.toFixed(1)}% vs ontem
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Hoje</p>
                  <p className="text-2xl font-semibold text-[#111827]">
                    {formatCurrency(stats.receitaHoje)}
                  </p>
                  {stats.percentualVariacaoReceita !== 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        stats.percentualVariacaoReceita > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.percentualVariacaoReceita > 0 ? "+" : ""}
                      {stats.percentualVariacaoReceita.toFixed(1)}% vs ontem
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos Pendentes</p>
                  <p className="text-2xl font-semibold text-[#111827]">
                    {stats.totalPedidosPendentes}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produtos Ativos</p>
                  <p className="text-2xl font-semibold text-[#111827]">
                    {stats.totalProdutosAtivos}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalProdutosInativos} inativos
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              Informações Básicas
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nome Fantasia</p>
                  <p className="font-medium text-[#111827]">{store.nomeFantasia}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Razão Social</p>
                  <p className="font-medium text-[#111827]">{store.razaoSocial}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">CNPJ</p>
                  <p className="font-medium text-[#111827]">{store.cnpj}</p>
                </div>
              </div>

              {store.descricao && (
                <div className="flex items-start space-x-3">
                  <BuildingStorefrontIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="font-medium text-[#111827]">{store.descricao}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Data de Cadastro</p>
                  <p className="font-medium text-[#111827]">
                    {formatDate(store.criadoEm)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-[#111827] mb-4">
              Informações de Contato
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Proprietário</p>
                  <p className="font-medium text-[#111827]">{store.usuarioNome}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">E-mail do Proprietário</p>
                  <p className="font-medium text-[#111827]">{store.usuarioEmail}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">E-mail da Loja</p>
                  <p className="font-medium text-[#111827]">{store.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-[#111827]">{store.telefone || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">
            Produtos da Loja ({products.length})
          </h2>
          
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhum produto cadastrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Preço
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Estoque
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.slice(0, 10).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {product.imagemUrl ? (
                            <img
                              src={product.imagemUrl}
                              alt={product.nome}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-[#111827]">
                            {product.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatCurrency(product.preco)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {product.estoque}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length > 10 && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  Mostrando 10 de {products.length} produtos
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStoreDetails;
