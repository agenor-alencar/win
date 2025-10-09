import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image,
  Save,
  Eye,
  Trash2,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import MerchantNavbar from "../../components/MerchantNavbar";

interface ProductImage {
  id: string;
  url: string;
  file?: File;
}

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface ProductData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  condition: string;
  price: number;
  comparePrice: number;
  cost: number;
  stock: number;
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  variations: ProductVariation[];
  tags: string[];
  isActive: boolean;
  requiresShipping: boolean;
  freeShipping: boolean;
  shippingTime: string;
  warranty: string;
  seoTitle: string;
  seoDescription: string;
}

export default function MerchantProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { success, error: notifyError } = useNotification();

  const [productData, setProductData] = useState<ProductData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    condition: "new",
    price: 0,
    comparePrice: 0,
    cost: 0,
    stock: 0,
    sku: "",
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    images: [],
    variations: [],
    tags: [],
    isActive: true,
    requiresShipping: true,
    freeShipping: false,
    shippingTime: "5-10",
    warranty: "",
    seoTitle: "",
    seoDescription: "",
  });

  const categories = [
    "Ferragens e Materiais de Construção",
    "Eletrônicos e Informática",
    "Casa e Decoração",
    "Moda e Beleza",
    "Esportes e Lazer",
    "Automotivo",
    "Saúde e Bem-estar",
    "Livros e Papelaria",
    "Alimentação",
    "Outros",
  ];

  const subcategories: Record<string, string[]> = {
    "Ferragens e Materiais de Construção": [
      "Parafusos e Fixadores",
      "Fechaduras e Dobradiças",
      "Tintas e Vernizes",
      "Ferramentas Manuais",
      "Materiais Hidráulicos",
      "Materiais Elétricos",
    ],
    "Eletrônicos e Informática": [
      "Smartphones",
      "Computadores",
      "Periféricos",
      "Acessórios",
    ],
    // Add more subcategories...
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages: ProductImage[] = files.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setProductData({
      ...productData,
      images: [...productData.images, ...newImages],
    });
  };

  const removeImage = (imageId: string) => {
    setProductData({
      ...productData,
      images: productData.images.filter((img) => img.id !== imageId),
    });
  };

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: `var-${Date.now()}`,
      name: "",
      price: productData.price,
      stock: 0,
      sku: "",
    };
    setProductData({
      ...productData,
      variations: [...productData.variations, newVariation],
    });
  };

  const updateVariation = (
    id: string,
    field: keyof ProductVariation,
    value: any,
  ) => {
    setProductData({
      ...productData,
      variations: productData.variations.map((variation) =>
        variation.id === id ? { ...variation, [field]: value } : variation,
      ),
    });
  };

  const removeVariation = (id: string) => {
    setProductData({
      ...productData,
      variations: productData.variations.filter((v) => v.id !== id),
    });
  };

  const addTag = (tag: string) => {
    if (tag && !productData.tags.includes(tag)) {
      setProductData({
        ...productData,
        tags: [...productData.tags, tag],
      });
    }
  };

  const removeTag = (tag: string) => {
    setProductData({
      ...productData,
      tags: productData.tags.filter((t) => t !== tag),
    });
  };

  const handleSave = async (isDraft = false) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      success(
        isDraft ? "Rascunho salvo!" : "Produto salvo com sucesso!",
        isDraft
          ? "Você pode continuar editando depois"
          : "Produto disponível na sua loja",
      );
    }, 2000);
  };

  const steps = [
    { id: 1, title: "Informações Básicas", icon: Package },
    { id: 2, title: "Preços e Estoque", icon: DollarSign },
    { id: 3, title: "Imagens e Variações", icon: Image },
    { id: 4, title: "Envio e SEO", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MerchantNavbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/merchant/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? "Editar Produto" : "Novo Produto"}
              </h1>
              <p className="text-gray-600">
                {isEdit
                  ? "Atualize as informações do seu produto"
                  : "Crie um novo anúncio para sua loja"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleSave(true)}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "border-[#3DBEAB] bg-[#3DBEAB] text-white"
                        : isCompleted
                          ? "border-[#3DBEAB] bg-[#3DBEAB] text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${isActive ? "text-[#3DBEAB]" : "text-gray-500"}`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${isCompleted ? "bg-[#3DBEAB]" : "bg-gray-300"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Produto *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Parafuso Phillips 3x20mm - Pacote com 100 unidades"
                      value={productData.title}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          title: e.target.value,
                        })
                      }
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500">
                      Seja específico e inclua detalhes importantes como
                      tamanho, cor, modelo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva detalhadamente seu produto, características, benefícios e forma de uso..."
                      rows={6}
                      value={productData.description}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          description: e.target.value,
                        })
                      }
                    />
                    <p className="text-sm text-gray-500">
                      Uma boa descrição aumenta as chances de venda
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={productData.category}
                        onValueChange={(value) =>
                          setProductData({
                            ...productData,
                            category: value,
                            subcategory: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategoria</Label>
                      <Select
                        value={productData.subcategory}
                        onValueChange={(value) =>
                          setProductData({ ...productData, subcategory: value })
                        }
                        disabled={!productData.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {(subcategories[productData.category] || []).map(
                            (subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        placeholder="Ex: Tramontina"
                        value={productData.brand}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            brand: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        placeholder="Ex: PRO-2000"
                        value={productData.model}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            model: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condição</Label>
                      <Select
                        value={productData.condition}
                        onValueChange={(value) =>
                          setProductData({ ...productData, condition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="used">Usado</SelectItem>
                          <SelectItem value="refurbished">
                            Recondicionado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Preços e Estoque */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Preços e Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço de Venda *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">
                          R$
                        </span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="pl-10"
                          value={productData.price}
                          onChange={(e) =>
                            setProductData({
                              ...productData,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comparePrice">Preço Comparativo</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">
                          R$
                        </span>
                        <Input
                          id="comparePrice"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="pl-10"
                          value={productData.comparePrice}
                          onChange={(e) =>
                            setProductData({
                              ...productData,
                              comparePrice: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Preço original (será mostrado riscado)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Custo do Produto</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">
                          R$
                        </span>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="pl-10"
                          value={productData.cost}
                          onChange={(e) =>
                            setProductData({
                              ...productData,
                              cost: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Apenas para seu controle
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantidade em Estoque *</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="0"
                        value={productData.stock}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU/Código</Label>
                      <Input
                        id="sku"
                        placeholder="Ex: PAR-PHI-3X20-100"
                        value={productData.sku}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            sku: e.target.value,
                          })
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Código único para controle interno
                      </p>
                    </div>
                  </div>

                  {/* Profit Margin Display */}
                  {productData.price > 0 && productData.cost > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">
                          Margem de Lucro:
                        </span>
                        <span className="text-lg font-bold text-green-900">
                          {(
                            ((productData.price - productData.cost) /
                              productData.price) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-green-700">
                          Lucro por unidade:
                        </span>
                        <span className="text-sm font-semibold text-green-900">
                          R$ {(productData.price - productData.cost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Imagens e Variações */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      Imagens do Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {productData.images.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={`Produto ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2 bg-[#3DBEAB]">
                              Principal
                            </Badge>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {productData.images.length < 8 && (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3DBEAB] transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Adicionar Foto
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      A primeira imagem será a principal. Máximo de 8 imagens.
                    </p>
                  </CardContent>
                </Card>

                {/* Variations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Tag className="h-5 w-5 mr-2" />
                        Variações do Produto
                      </span>
                      <Button onClick={addVariation} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Variação
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productData.variations.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhuma variação adicionada. Clique em "Adicionar
                        Variação" para criar opções como cores, tamanhos, etc.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {productData.variations.map((variation) => (
                          <div
                            key={variation.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label>Nome da Variação</Label>
                                <Input
                                  placeholder="Ex: Azul, Grande, 110V"
                                  value={variation.name}
                                  onChange={(e) =>
                                    updateVariation(
                                      variation.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Preço</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-3 text-gray-500">
                                    R$
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="pl-10"
                                    value={variation.price}
                                    onChange={(e) =>
                                      updateVariation(
                                        variation.id,
                                        "price",
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Estoque</Label>
                                <Input
                                  type="number"
                                  value={variation.stock}
                                  onChange={(e) =>
                                    updateVariation(
                                      variation.id,
                                      "stock",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>SKU</Label>
                                <div className="flex">
                                  <Input
                                    placeholder="Código"
                                    value={variation.sku}
                                    onChange={(e) =>
                                      updateVariation(
                                        variation.id,
                                        "sku",
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="ml-2"
                                    onClick={() =>
                                      removeVariation(variation.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Envio e SEO */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Shipping */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Envio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Produto requer envio</Label>
                        <p className="text-sm text-gray-500">
                          Desative para produtos digitais ou serviços
                        </p>
                      </div>
                      <Switch
                        checked={productData.requiresShipping}
                        onCheckedChange={(checked) =>
                          setProductData({
                            ...productData,
                            requiresShipping: checked,
                          })
                        }
                      />
                    </div>

                    {productData.requiresShipping && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight">Peso (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              value={productData.weight}
                              onChange={(e) =>
                                setProductData({
                                  ...productData,
                                  weight: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="length">Comprimento (cm)</Label>
                            <Input
                              id="length"
                              type="number"
                              placeholder="0"
                              value={productData.dimensions.length}
                              onChange={(e) =>
                                setProductData({
                                  ...productData,
                                  dimensions: {
                                    ...productData.dimensions,
                                    length: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="width">Largura (cm)</Label>
                            <Input
                              id="width"
                              type="number"
                              placeholder="0"
                              value={productData.dimensions.width}
                              onChange={(e) =>
                                setProductData({
                                  ...productData,
                                  dimensions: {
                                    ...productData.dimensions,
                                    width: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height">Altura (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              placeholder="0"
                              value={productData.dimensions.height}
                              onChange={(e) =>
                                setProductData({
                                  ...productData,
                                  dimensions: {
                                    ...productData.dimensions,
                                    height: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>Frete grátis</Label>
                              <p className="text-sm text-gray-500">
                                O frete será por sua conta
                              </p>
                            </div>
                            <Switch
                              checked={productData.freeShipping}
                              onCheckedChange={(checked) =>
                                setProductData({
                                  ...productData,
                                  freeShipping: checked,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="shippingTime">
                              Prazo de Entrega
                            </Label>
                            <Select
                              value={productData.shippingTime}
                              onValueChange={(value) =>
                                setProductData({
                                  ...productData,
                                  shippingTime: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-3">
                                  1 a 3 dias úteis
                                </SelectItem>
                                <SelectItem value="3-5">
                                  3 a 5 dias úteis
                                </SelectItem>
                                <SelectItem value="5-10">
                                  5 a 10 dias úteis
                                </SelectItem>
                                <SelectItem value="10-15">
                                  10 a 15 dias úteis
                                </SelectItem>
                                <SelectItem value="15-30">
                                  15 a 30 dias úteis
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="warranty">Garantia</Label>
                      <Input
                        id="warranty"
                        placeholder="Ex: 12 meses de garantia do fabricante"
                        value={productData.warranty}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            warranty: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO e Otimização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">Título SEO</Label>
                      <Input
                        id="seoTitle"
                        placeholder="Título para mecanismos de busca"
                        value={productData.seoTitle}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            seoTitle: e.target.value,
                          })
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Máximo 60 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">Descrição SEO</Label>
                      <Textarea
                        id="seoDescription"
                        placeholder="Descrição para mecanismos de busca"
                        rows={3}
                        value={productData.seoDescription}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            seoDescription: e.target.value,
                          })
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Máximo 160 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags do Produto</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {productData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex">
                        <Input
                          placeholder="Digite uma tag e pressione Enter"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTag(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Tags ajudam na busca do produto. Ex: parafuso, ferragem,
                        fixação
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="ml-auto bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
                >
                  Próximo
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSave(false)}
                  className="ml-auto bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Publicar Produto"}
                  <Save className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Produto Ativo</Label>
                  <Switch
                    checked={productData.isActive}
                    onCheckedChange={(checked) =>
                      setProductData({ ...productData, isActive: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {productData.isActive
                      ? "Produto será visível na sua loja"
                      : "Produto não aparecerá na sua loja"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Dicas para Vender Mais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Use títulos descritivos e específicos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Adicione fotos de qualidade em diferentes ângulos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Seja detalhado na descrição</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Mantenha preços competitivos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Ofereça frete grátis quando possível</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
