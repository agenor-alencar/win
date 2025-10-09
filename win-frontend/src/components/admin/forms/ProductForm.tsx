import React, { useState } from "react";
import { AdminModal } from "../AdminModal";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    condition: "Novo",
    // Store Info
    storeId: "",
    storeName: "",
    // Pricing & Inventory
    price: "",
    comparePrice: "",
    cost: "",
    stock: "",
    sku: "",
    // Images & Media
    images: [] as string[],
    mainImage: "",
    // Specifications
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    // Shipping
    freeShipping: false,
    shippingWeight: "",
    processingTime: "1-2",
    // SEO
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    // Variations
    hasVariations: false,
    variations: [] as any[],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const categories = [
    "Eletrônicos",
    "Roupas & Moda",
    "Casa & Jardim",
    "Esportes & Lazer",
    "Beleza & Saúde",
    "Livros & Papelaria",
    "Brinquedos",
    "Automotivo",
    "Alimentação",
    "Ferramentas",
  ];

  const subcategories = {
    Eletrônicos: ["Smartphones", "Tablets", "Notebooks", "Acessórios", "Audio"],
    "Roupas & Moda": [
      "Camisetas",
      "Calças",
      "Vestidos",
      "Sapatos",
      "Acessórios",
    ],
    "Casa & Jardim": ["Móveis", "Decoração", "Cozinha", "Jardim", "Limpeza"],
    "Esportes & Lazer": [
      "Fitness",
      "Futebol",
      "Natação",
      "Ciclismo",
      "Camping",
    ],
    "Beleza & Saúde": ["Cosméticos", "Perfumes", "Cuidados", "Suplementos"],
  };

  const stores = [
    { id: "2001", name: "TechStore Pro" },
    { id: "2002", name: "Moda Feminina" },
    { id: "2003", name: "Casa Moderna" },
    { id: "2004", name: "Sport Center" },
    { id: "2005", name: "Beauty Shop" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      model: "",
      condition: "Novo",
      storeId: "",
      storeName: "",
      price: "",
      comparePrice: "",
      cost: "",
      stock: "",
      sku: "",
      images: [],
      mainImage: "",
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
      freeShipping: false,
      shippingWeight: "",
      processingTime: "1-2",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      hasVariations: false,
      variations: [],
    });
    setCurrentStep(1);
    onClose();
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.description &&
          formData.category &&
          formData.storeId
        );
      case 2:
        return formData.price && formData.stock;
      case 3:
        return true; // Images are optional
      case 4:
        return true; // SEO is optional
      default:
        return false;
    }
  };

  const calculateProfitMargin = () => {
    if (formData.price && formData.cost) {
      const price = parseFloat(formData.price);
      const cost = parseFloat(formData.cost);
      const margin = ((price - cost) / price) * 100;
      return margin.toFixed(1);
    }
    return "0";
  };

  const stepTitles = [
    "Informações Básicas",
    "Preços e Estoque",
    "Imagens e Especificações",
    "SEO e Finalização",
  ];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cadastrar Novo Produto"
      size="xl"
      actions={
        <div className="flex justify-between w-full">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={!canProceed()}
              className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps ? "Cadastrar Produto" : "Próximo"}
            </button>
          </div>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {stepTitles[currentStep - 1]} - Etapa {currentStep} de{" "}
              {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Informações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loja Proprietária *
              </label>
              <select
                required
                value={formData.storeId}
                onChange={(e) => {
                  const selectedStore = stores.find(
                    (s) => s.id === e.target.value,
                  );
                  updateFormData("storeId", e.target.value);
                  updateFormData("storeName", selectedStore?.name || "");
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="">Selecione a loja</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Ex: iPhone 14 Pro Max 256GB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Descreva o produto detalhadamente..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => {
                    updateFormData("category", e.target.value);
                    updateFormData("subcategory", "");
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategoria
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    updateFormData("subcategory", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  disabled={!formData.category}
                >
                  <option value="">Selecione</option>
                  {formData.category &&
                    subcategories[
                      formData.category as keyof typeof subcategories
                    ]?.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => updateFormData("brand", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Ex: Apple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateFormData("model", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Ex: A2894"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condição
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => updateFormData("condition", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                >
                  <option value="Novo">Novo</option>
                  <option value="Usado">Usado</option>
                  <option value="Recondicionado">Recondicionado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Inventory */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Preços e Estoque
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço de Venda *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Comparativo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) =>
                    updateFormData("comparePrice", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo do Produto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => updateFormData("cost", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Profit Margin Calculator */}
            {formData.price && formData.cost && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  Margem de Lucro: {calculateProfitMargin()}%
                </p>
                <p className="text-green-700 text-sm">
                  Lucro: R${" "}
                  {(
                    parseFloat(formData.price) - parseFloat(formData.cost)
                  ).toFixed(2)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade em Estoque *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => updateFormData("stock", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Código)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => updateFormData("sku", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Ex: IPH14PM256"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Images & Specifications */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Imagens e Especificações
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem Principal
              </label>
              <input
                type="url"
                value={formData.mainImage}
                onChange={(e) => updateFormData("mainImage", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => updateFormData("weight", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensões (cm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.length}
                  onChange={(e) =>
                    updateFormData("dimensions.length", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Comprimento"
                />
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.width}
                  onChange={(e) =>
                    updateFormData("dimensions.width", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Largura"
                />
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.height}
                  onChange={(e) =>
                    updateFormData("dimensions.height", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Altura"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.freeShipping}
                  onChange={(e) =>
                    updateFormData("freeShipping", e.target.checked)
                  }
                  className="rounded border-gray-300 text-[#3DBEAB] focus:ring-[#3DBEAB]"
                />
                <span className="ml-2 text-sm text-gray-700">Frete grátis</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Processamento
                </label>
                <select
                  value={formData.processingTime}
                  onChange={(e) =>
                    updateFormData("processingTime", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                >
                  <option value="1-2">1-2 dias úteis</option>
                  <option value="3-5">3-5 dias úteis</option>
                  <option value="5-7">5-7 dias úteis</option>
                  <option value="7-10">7-10 dias úteis</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: SEO & Finalization */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              SEO e Finalização
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título SEO
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => updateFormData("metaTitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Título otimizado para motores de busca"
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres: {formData.metaTitle.length}/60
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição SEO
              </label>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) =>
                  updateFormData("metaDescription", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Descrição para motores de busca"
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres: {formData.metaDescription.length}/160
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palavras-chave (separadas por vírgula)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => updateFormData("keywords", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="smartphone, apple, iphone, premium"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-blue-800 mb-2">
                Resumo do Produto
              </h4>
              <div className="text-blue-700 text-sm space-y-1">
                <p>
                  <strong>Produto:</strong> {formData.title || "Não informado"}
                </p>
                <p>
                  <strong>Loja:</strong>{" "}
                  {formData.storeName || "Não selecionada"}
                </p>
                <p>
                  <strong>Categoria:</strong>{" "}
                  {formData.category || "Não informada"}
                </p>
                <p>
                  <strong>Preço:</strong> R$ {formData.price || "0,00"}
                </p>
                <p>
                  <strong>Estoque:</strong> {formData.stock || "0"} unidades
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </AdminModal>
  );
};
