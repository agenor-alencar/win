import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { categoryApi, Category, CategoryCreateRequest } from "../../lib/CategoryApi";
import { useToast } from "../../hooks/use-toast";

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CategoryCreateRequest>({
    nome: "",
    descricao: "",
  });

  // Carregar categorias
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
      descricao: category.descricao || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await categoryApi.deleteCategory(categoryId);
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
      loadCategories();
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, formData);
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        await categoryApi.createCategory(formData);
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
      }
      handleCloseModal();
      loadCategories();
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar categoria",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ nome: "", descricao: "" });
  };

  // Organizar categorias em árvore (principais e subcategorias)
  const mainCategories = categories.filter((cat) => !cat.categoriaPaiId);
  const getSubCategories = (parentId: string) => {
    return categories.filter((cat) => cat.categoriaPaiId === parentId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie as categorias de produtos do marketplace
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadCategories}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Atualizar
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderOpenIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categorias Principais</p>
                <p className="text-2xl font-bold text-gray-900">{mainCategories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FolderIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Subcategorias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.length - mainCategories.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-4 text-gray-500">Carregando categorias...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhuma categoria cadastrada
              </h3>
              <p className="mt-2 text-gray-500">
                Comece criando sua primeira categoria de produtos
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar Categoria
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Criação
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mainCategories.map((category) => {
                    const subCategories = getSubCategories(category.id);
                    return (
                      <React.Fragment key={category.id}>
                        {/* Categoria Principal */}
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FolderIcon className="h-5 w-5 text-blue-500 mr-3" />
                              <div className="text-sm font-medium text-gray-900">
                                {category.nome}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {category.descricao || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Principal
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(category.criadoEm).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <PencilIcon className="h-5 w-5 inline" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                        {/* Subcategorias */}
                        {subCategories.map((subCategory) => (
                          <tr key={subCategory.id} className="hover:bg-gray-50 bg-gray-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center pl-8">
                                <FolderOpenIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <div className="text-sm text-gray-700">
                                  {subCategory.nome}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {subCategory.descricao || "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Subcategoria
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(subCategory.criadoEm).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(subCategory)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <PencilIcon className="h-5 w-5 inline" />
                              </button>
                              <button
                                onClick={() => handleDelete(subCategory.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para criar/editar categoria */}
      <AdminModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Eletrônicos"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva os tipos de produtos desta categoria..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              {editingCategory ? "Atualizar" : "Criar"}
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
};

export default AdminCategories;
