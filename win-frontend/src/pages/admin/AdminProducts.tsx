import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import { ProductForm } from "../../components/admin/forms/ProductForm";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const AdminProducts: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleCreateProduct = (productData: any) => {
    console.log("Creating product:", productData);
    // Here you would typically send the data to your backend
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

  const products = [
    {
      id: "P001",
      image: "/products/iphone.jpg",
      title: "iPhone 14 Pro Max 256GB",
      category: "Eletrônicos",
      store: "TechStore Pro",
      storeId: "2001",
      price: "7,299.90",
      stock: 15,
      status: "Ativo",
      createdAt: "20/07/2024",
      description:
        "iPhone 14 Pro Max com tela Super Retina XDR de 6,7 polegadas, chip A16 Bionic e sistema de câmera Pro avançado.",
      sku: "IPH14PM256",
      weight: "0.24",
      dimensions: "16 x 7.8 x 0.78 cm",
      brand: "Apple",
      condition: "Novo",
      views: 1250,
      sales: 45,
      rating: 4.8,
      reviews: 23,
      tags: ["smartphone", "apple", "premium"],
    },
    {
      id: "P002",
      image: "/products/dress.jpg",
      title: "Vestido Floral Verão 2024",
      category: "Roupas",
      store: "Moda Feminina",
      storeId: "2002",
      price: "89.90",
      stock: 0,
      status: "Inativo",
      createdAt: "18/07/2024",
      description: "Vestido floral leve e confortável, perfeito para o verão.",
      sku: "VF2024-001",
      weight: "0.15",
      dimensions: "30 x 40 x 2 cm",
      brand: "Moda Feminina",
      condition: "Novo",
      views: 456,
      sales: 12,
      rating: 4.5,
      reviews: 8,
      tags: ["vestido", "floral", "verão"],
    },
    {
      id: "P003",
      image: "/products/sofa.jpg",
      title: "Sofá 3 Lugares Cinza",
      category: "Casa & Jardim",
      store: "Casa Moderna",
      storeId: "2003",
      price: "1,299.90",
      stock: 5,
      status: "Irregular",
      createdAt: "15/07/2024",
      description:
        "Sofá moderno de 3 lugares em tecido cinza com pés de madeira.",
      sku: "SF3L-CINZA",
      weight: "85.5",
      dimensions: "200 x 90 x 85 cm",
      brand: "Casa Moderna",
      condition: "Novo",
      views: 789,
      sales: 3,
      rating: 4.2,
      reviews: 5,
      tags: ["sofá", "móveis", "sala"],
      irregularReason: "Imagens de baixa qualidade",
    },
    {
      id: "P004",
      image: "/products/sneaker.jpg",
      title: "Tênis Esportivo Preto",
      category: "Esportes",
      store: "Sport Center",
      storeId: "2004",
      price: "199.90",
      stock: 28,
      status: "Ativo",
      createdAt: "12/07/2024",
      description: "Tênis esportivo confortável para corrida e academia.",
      sku: "TE-ESP-001",
      weight: "0.8",
      dimensions: "32 x 20 x 12 cm",
      brand: "SportMax",
      condition: "Novo",
      views: 892,
      sales: 67,
      rating: 4.7,
      reviews: 34,
      tags: ["tênis", "esportivo", "corrida"],
    },
  ];

  const categories = [
    "Eletrônicos",
    "Roupas",
    "Casa & Jardim",
    "Esportes",
    "Beleza",
  ];

  const actions: Action[] = [
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
      onClick: (product) => {
        console.log("Toggle product status:", product.id);
      },
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

  const filteredProducts = products.filter((product) => {
    if (filterCategory !== "all" && product.category !== filterCategory)
      return false;
    if (filterStatus !== "all" && product.status !== filterStatus) return false;
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
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
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
                <p className="text-xl font-semibold text-[#111827]">8,547</p>
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
                <p className="text-xl font-semibold text-[#111827]">234</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Irregulares</p>
                <p className="text-xl font-semibold text-[#111827]">12</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-xl font-semibold text-[#111827]">89</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>
          </div>
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
                    {selectedProduct.title}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct.sku}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Categoria:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loja:</span>
                      <span className="ml-2 font-medium">
                        {selectedProduct.store}
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
