import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  Bars3Icon,
  FolderIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productsCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Eletrônicos",
      icon: "📱",
      description: "Smartphones, tablets, notebooks e acessórios",
      productsCount: 1250,
      isActive: true,
      order: 1,
      createdAt: "15/01/2024",
    },
    {
      id: "2",
      name: "Roupas & Moda",
      icon: "👕",
      description: "Roupas masculinas, femininas e infantis",
      productsCount: 890,
      isActive: true,
      order: 2,
      createdAt: "15/01/2024",
    },
    {
      id: "3",
      name: "Casa & Jardim",
      icon: "🏠",
      description: "Móveis, decoração e itens para o lar",
      productsCount: 567,
      isActive: true,
      order: 3,
      createdAt: "15/01/2024",
    },
    {
      id: "4",
      name: "Esportes & Lazer",
      icon: "⚽",
      description: "Artigos esportivos e equipamentos fitness",
      productsCount: 234,
      isActive: true,
      order: 4,
      createdAt: "15/01/2024",
    },
    {
      id: "5",
      name: "Beleza & Saúde",
      icon: "💄",
      description: "Cosméticos, perfumes e produtos de saúde",
      productsCount: 345,
      isActive: false,
      order: 5,
      createdAt: "15/01/2024",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedItem, setDraggedItem] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    isActive: true,
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      description: category.description,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    }
  };

  const handleSubmit = () => {
    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat,
        ),
      );
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        productsCount: 0,
        order: categories.length + 1,
        createdAt: new Date().toLocaleDateString("pt-BR"),
      };
      setCategories([...categories, newCategory]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", icon: "", description: "", isActive: true });
  };

  const handleDragStart = (category: Category) => {
    setDraggedItem(category);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetCategory.id) return;

    const newCategories = [...categories];
    const draggedIndex = newCategories.findIndex(
      (cat) => cat.id === draggedItem.id,
    );
    const targetIndex = newCategories.findIndex(
      (cat) => cat.id === targetCategory.id,
    );

    // Remove the dragged item and insert it at the target position
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    // Update order values
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }));

    setCategories(updatedCategories);
    setDraggedItem(null);
  };

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat,
      ),
    );
  };

  const sortedCategories = categories.sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Categorias
            </h1>
            <p className="text-gray-600">
              Organize e gerencie as categorias de produtos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Nova Categoria</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Categorias Ativas</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {categories.filter((cat) => cat.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {categories
                    .reduce((sum, cat) => sum + cat.productsCount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-purple-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Média por Categoria</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {Math.round(
                    categories.reduce(
                      (sum, cat) => sum + cat.productsCount,
                      0,
                    ) / categories.length,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#111827]">
              Categorias (Arraste para reordenar)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {sortedCategories.map((category) => (
              <div
                key={category.id}
                draggable
                onDragStart={() => handleDragStart(category)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category)}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-move ${
                  draggedItem?.id === category.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Bars3Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        #{category.order}
                      </span>
                    </div>
                    <div className="text-2xl">{category.icon}</div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-[#111827]">
                          {category.name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.isActive ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          {category.productsCount.toLocaleString()} produtos
                        </span>
                        <span>Criada em {category.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCategoryStatus(category.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        category.isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {category.isActive ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-[#3DBEAB] transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Modal */}
        <AdminModal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
          size="md"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                {editingCategory ? "Salvar" : "Criar"}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Ex: Eletrônicos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ícone (Emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="📱"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Descreva os tipos de produtos desta categoria..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Categoria ativa
              </label>
            </div>
          </div>
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
