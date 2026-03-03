import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { ProductForm } from "../../components/admin/forms/ProductForm";
import { AdvancedFilters, FilterConfig } from "../../components/admin/AdvancedFilters";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { productApi, type ProductFormatted } from "@/lib/admin";
import { categoryApi, type Category } from "@/lib/CategoryApi";
import { useNotification } from "@/contexts/NotificationContext";

const AdminProducts: React.FC = () => {
  const { success, error } = useNotification();
  const [selectedProduct, setSelectedProduct] = useState<ProductFormatted | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    category: "all",
    status: "all",
    stock: "all",
  });
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    semEstoque: 0,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [formattedProducts, productStats] = await Promise.all([
        productApi.getFormattedProducts(),
        productApi.getStats(),
      ]);

      setProducts(formattedProducts);
      setStats(productStats);
    } catch (err: any) {
      console.error("Erro ao carregar produtos:", err);
      error(err.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [error]);

  const loadCategories = useCallback(async () => {
    try {
      const allCategories = await categoryApi.getAllCategories();
      setCategories(allCategories);
    } catch (err: any) {
      console.error("Erro ao carregar categorias:", err);
      // Não exibir erro para o usuário, apenas logar
    }
  }, []);

  const handleDeleteProduct = useCallback(async (product: ProductFormatted) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.title}"?`)) {
      return;
    }

    try {
      await productApi.deleteProduct(product.id);
      success("Produto excluído com sucesso");
      loadProducts();
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      error(error.message || "Erro ao excluir produto");
    }
  }, [loadProducts, success, error]);

  const handleToggleProductStatus = async (product: ProductFormatted) => {
    try {
      await productApi.toggleProductStatus(product.id, product.ativo);
      success(
        `Produto ${product.ativo ? "desativado" : "ativado"} com sucesso`
      );
      loadProducts();
    } catch (error: any) {
      console.error("Erro ao alterar status do produto:", error);
      error(error.message || "Erro ao alterar status do produto");
    }
  };

  const handleCreateProduct = (productData: any) => {
    console.log("Creating product:", productData);
    // TODO: Implementar criação de produto
    setShowCreateProductModal(false);
  };

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    {
      key: "image",
      label: "Imagem",
      render: (image) => (
        <img
          src={image}
          alt="Produto"
          loading="lazy"
          className="w-12 h-12 object-cover rounded border"
          onError={(e) => {
            (e.target as any).src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEwyOCAyOEgyMFYyMFoiIGZpbGw9IiNFNUU3RUIiLz4KPHA+CjxwYXRoIGQ9Ik0yOCAyMEwyMCAyOEgyOFYyMFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+Cg==";
          }}
        />
      ),
    },
    { key: "title", label: "Nome", sortable: true },
    { key: "category", label: "Categoria", sortable: true },
    { key: "store", label: "Loja", sortable: true },
    {
      key: "price",
      label: "Preço",
      sortable: true,
      render: (price) => `R$ ${price}`,
    },
    { key: "stock", label: "Estoque", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "Ativo"
              ? "bg-green-100 text-green-800"
              : status === "Inativo"
                ? "bg-gray-100 text-gray-800"
                : status === "Irregular"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "createdAt", label: "Criado em", sortable: true },
  ];

  const actions = [
    {
      label: "Ver Detalhes",
      onClick: (product) => {
        setSelectedProduct(product);
        setShowProductModal(true);
      },
      color: "primary",
    },
    {
      label: "Ativar/Desativar",
      onClick: (product) => handleToggleProductStatus(product),
      color: "secondary",
    },
    {
      label: "Marcar como Irregular",
      onClick: (product) => {
        console.log("Mark as irregular:", product.id);
      },
      color: "danger",
    },
  ];

  // Configuração dos filtros
  const filterConfigs: FilterConfig[] = [
    {
      id: "category",
      label: "Categoria",
      options: [
        { label: "Todas", value: "all" },
        ...categories.map((cat) => ({ label: cat.nome, value: cat.nome })),
      ],
      defaultValue: "all",
    },
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Todos", value: "all" },
        { label: "Ativo", value: "Ativo" },
        { label: "Inativo", value: "Inativo" },
        { label: "Irregular", value: "Irregular" },
      ],
      defaultValue: "all",
    },
    {
      id: "stock",
      label: "Estoque",
      options: [
        { label: "Todos", value: "all" },
        { label: "Em estoque", value: "in-stock" },
        { label: "Sem estoque", value: "out-of-stock" },
        { label: "Estoque baixo", value: "low-stock" },
      ],
      defaultValue: "all",
    },
  ];

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [filterId]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({
      category: "all",
      status: "all",
      stock: "all",
    });
  };

  const filteredProducts = products.filter((product) => {
    // Filtro de categoria
    if (activeFilters.category !== "all" && product.category !== activeFilters.category) {
      return false;
    }
    
    // Filtro de status
    if (activeFilters.status !== "all" && product.status !== activeFilters.status) {
      return false;
    }
    
    // Filtro de estoque
    if (activeFilters.stock !== "all") {
      const stockValue = product.stock || 0;
      if (activeFilters.stock === "in-stock" && stockValue <= 0) {
        return false;
      }
      if (activeFilters.stock === "out-of-stock" && stockValue > 0) {
        return false;
      }
      if (activeFilters.stock === "low-stock" && (stockValue > 10 || stockValue <= 0)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Produtos
            </h1>
            <p className="text-gray-600">
              Monitore e gerencie todos os produtos do marketplace
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
            <button
              onClick={() => setShowCreateProductModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Produtos Ativos</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.ativos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-gray-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.inativos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Sem Estoque</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.semEstoque}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-semibold text-[#111827]">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AdvancedFilters
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products Table */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          actions={actions}
          itemsPerPage={10}
        />

        {/* Product Details Modal */}
        <AdminModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          title="Detalhes do Produto"
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Desativar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Editar Produto
              </button>
            </div>
          }
        >
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image */}
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as any).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDMwMCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTAwTDE3NSAxNTBIMTI1VjEwMFoiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTE3NSAxMDBMMTI1IDE1MEgxNzVWMTAwWiIgZmlsbD0iI0U1RTdFQiIvPgo8dGV4dCB4PSIxNTAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4NCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiPlByb2R1dG88L3RleHQ+Cjwvc3ZnPgo=";
                    }}
                  />
                </div>

                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-[#111827] mb-3">
                    {selectedProduct?.title || "Produto"}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct?.sku || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Categoria:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct?.category || "Sem categoria"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loja:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct?.store || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Marca:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct.brand}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Condição:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct.condition}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedProduct.status === "Ativo"
                            ? "bg-green-100 text-green-800"
                            : selectedProduct.status === "Inativo"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Descrição
                </h4>
                <p className="text-gray-600 text-sm">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-semibold text-[#111827]">
                    R$ {selectedProduct.price}
                  </p>
                  <p className="text-xs text-gray-600">Preço</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-semibold text-[#111827]">
                    {selectedProduct.stock}
                  </p>
                  <p className="text-xs text-gray-600">Estoque</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-semibold text-[#111827]">
                    {selectedProduct.sales}
                  </p>
                  <p className="text-xs text-gray-600">Vendas</p>
                </div>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-semibold text-[#111827]">
                    {selectedProduct.views.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Visualizações</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-semibold text-[#111827]">
                    {selectedProduct.rating} ★
                  </p>
                  <p className="text-xs text-gray-600">Avaliação</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-lg font-semibold text-[#111827]">
                    {selectedProduct.reviews}
                  </p>
                  <p className="text-xs text-gray-600">Avaliações</p>
                </div>
              </div>

              {/* Physical Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Informações Físicas
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Peso:</span>
                    <span className="ml-2 font-medium">
                      {selectedProduct.weight} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dimensões:</span>
                    <span className="ml-2 font-medium">
                      {selectedProduct.dimensions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Irregular reason if applicable */}
              {selectedProduct.status === "Irregular" &&
                selectedProduct.irregularReason && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Motivo da Irregularidade
                    </h4>
                    <p className="text-sm text-red-600">
                      {selectedProduct.irregularReason}
                    </p>
                  </div>
                )}
            </div>
          )}
        </AdminModal>

        {/* Product Creation Form */}
        <ProductForm
          isOpen={showCreateProductModal}
          onClose={() => setShowCreateProductModal(false)}
          onSubmit={handleCreateProduct}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
