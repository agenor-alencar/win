import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Package, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/Api";
import { MerchantLayout } from "@/components/MerchantLayout";

interface ProductFormData {
  nome: string;
  descricao: string;
  preco: string;
  estoque: string;
  sku: string;
  categoriaId: string;
}

interface Categoria {
  id: string;
  nome: string;
}

interface ImagemProduto {
  id: string;
  url: string;
  textoAlternativo?: string;
  ordemExibicao: number;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isEditing = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lojistaId, setLojistaId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagens, setImagens] = useState<ImagemProduto[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    sku: "",
    categoriaId: "",
  });

  // Buscar ID do lojista
  useEffect(() => {
    const fetchLojistaId = async () => {
      if (!user?.email) {
        console.log("User email não disponível");
        return;
      }
      
      try {
        console.log("Buscando lojista para:", user.email);
        // Busca o lojista logado diretamente
        const lojistaResponse = await api.get(`/api/v1/lojistas/me`);
        console.log("Lojista encontrado:", lojistaResponse.data);
        setLojistaId(lojistaResponse.data.id);
      } catch (error: any) {
        console.error("Erro ao buscar dados do lojista:", error);
        console.error("Detalhes do erro:", error.response?.data);
        toast({
          title: "Erro ao identificar lojista",
          description: error.response?.data?.message || "Não foi possível identificar seu perfil de lojista.",
          variant: "destructive",
        });
      }
    };

    fetchLojistaId();
  }, [user, toast]);

  // Carregar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get("/api/v1/categoria/list/all");
        console.log("Categorias carregadas:", response.data);
        
        // Garantir que seja um array
        if (Array.isArray(response.data)) {
          setCategorias(response.data);
        } else {
          console.warn("Resposta de categorias não é um array:", response.data);
          setCategorias([]);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setCategorias([]); // Garantir array vazio em caso de erro
        toast({
          title: "Aviso",
          description: "Não foi possível carregar as categorias. Contate o administrador.",
          variant: "destructive",
        });
      }
    };

    fetchCategorias();
  }, [toast]);

  // Carregar produto se estiver editando
  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchProduto = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/v1/produtos/${id}`);
        const produto = response.data;
        
        console.log("Produto carregado:", produto);
        
        setFormData({
          nome: produto.nome || "",
          descricao: produto.descricao || "",
          preco: produto.preco != null ? produto.preco.toString() : "",
          estoque: produto.estoque != null ? produto.estoque.toString() : "0",
          sku: produto.sku || "",
          categoriaId: produto.categoria?.id || "",
        });

        // Carregar imagens do produto
        try {
          const imagensResponse = await api.get(`/api/v1/imagens-produto/produto/${id}`);
          setImagens(imagensResponse.data);
        } catch (error) {
          console.error("Erro ao carregar imagens:", error);
        }
      } catch (error: any) {
        console.error("Erro ao carregar produto:", error);
        toast({
          title: "Erro ao carregar produto",
          description: error.response?.data?.message || "Produto não encontrado.",
          variant: "destructive",
        });
        navigate("/merchant/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduto();
  }, [id, isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (produtoId: string) => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formData = new FormData();
        formData.append("arquivo", selectedFiles[i]);
        formData.append("ordemExibicao", (imagens.length + i + 1).toString());

        await api.post(`/api/v1/imagens-produto/produto/${produtoId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast({
        title: "Sucesso",
        description: "Imagens enviadas com sucesso!",
      });

      setSelectedFiles([]);
      
      // Recarregar imagens
      const imagensResponse = await api.get(`/api/v1/imagens-produto/produto/${produtoId}`);
      setImagens(imagensResponse.data);
    } catch (error: any) {
      console.error("Erro ao enviar imagens:", error);
      toast({
        title: "Erro ao enviar imagens",
        description: error.response?.data?.message || "Erro ao fazer upload das imagens.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const deleteImage = async (imagemId: string) => {
    try {
      await api.delete(`/api/v1/imagens-produto/${imagemId}`);
      setImagens(prev => prev.filter(img => img.id !== imagemId));
      toast({
        title: "Imagem removida",
        description: "Imagem removida com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao deletar imagem:", error);
      toast({
        title: "Erro ao deletar imagem",
        description: error.response?.data?.message || "Erro ao remover a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lojistaId) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu perfil de lojista.",
        variant: "destructive",
      });
      return;
    }

    // Validações
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      toast({
        title: "Preço inválido",
        description: "O preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.estoque || parseInt(formData.estoque) < 0) {
      toast({
        title: "Estoque inválido",
        description: "A quantidade de estoque deve ser maior ou igual a zero.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque),
        sku: formData.sku.trim() || undefined,
        categoriaId: formData.categoriaId || undefined,
      };

      if (isEditing) {
        // Atualizar produto existente
        await api.put(`/api/v1/produtos/${id}`, payload);
        
        toast({
          title: "✅ Produto atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });

        // Redirecionar para lista de produtos
        navigate("/merchant/products");
      } else {
        // Criar novo produto
        console.log("Criando produto para lojista:", lojistaId);
        console.log("Payload:", payload);
        const response = await api.post(`/api/v1/produtos/lojista/${lojistaId}`, payload);
        console.log("Produto criado:", response.data);
        const produtoId = response.data.id;
        
        // Fazer upload de imagens se houver
        if (selectedFiles.length > 0) {
          try {
            await uploadImages(produtoId);
            toast({
              title: "✅ Produto criado com imagens!",
              description: "O produto e suas imagens foram adicionados ao seu catálogo.",
            });
          } catch (error) {
            toast({
              title: "⚠️ Produto criado, mas erro nas imagens",
              description: "O produto foi criado, mas houve erro ao enviar algumas imagens.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "✅ Produto criado!",
            description: "O produto foi adicionado ao seu catálogo.",
          });
        }

        // Redirecionar para lista de produtos
        navigate("/merchant/products");
      }
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      console.error("Detalhes do erro:", error.response?.data);
      console.error("Status:", error.response?.status);
      
      let errorMessage = "Tente novamente mais tarde.";
      
      if (error.response?.status === 401) {
        errorMessage = "Você precisa estar logado como lojista para criar produtos.";
      } else if (error.response?.status === 403) {
        errorMessage = "Você não tem permissão para criar produtos.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Erro ao salvar produto",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MerchantLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#3DBEAB]" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/merchant/products")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-[#3DBEAB]" />
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Atualize as informações do produto" : "Adicione um novo produto ao seu catálogo"}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Parafuso Phillips 3x20mm"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva detalhes do produto..."
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  rows={4}
                />
              </div>

              {/* SKU e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU (Código)</Label>
                  <Input
                    id="sku"
                    placeholder="Ex: PAR-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoriaId}
                    onValueChange={(value) => handleInputChange("categoriaId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categorias) && categorias.length > 0 ? (
                        categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhuma categoria disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preço e Estoque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.preco}
                    onChange={(e) => handleInputChange("preco", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="estoque">Quantidade em Estoque *</Label>
                  <Input
                    id="estoque"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.estoque}
                    onChange={(e) => handleInputChange("estoque", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Informação sobre imagens no modo criação */}
              {!isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Você pode adicionar imagens agora ou depois de criar o produto.
                  </p>
                </div>
              )}

              {/* Upload de Imagens - Disponível em ambos os modos */}
              <div className="space-y-4 border-t pt-6">
                  <div>
                    <Label>Imagens do Produto</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Adicione imagens para destacar seu produto
                    </p>
                    <div className="mt-2">
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3DBEAB] hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Clique para selecionar imagens
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Preview das imagens selecionadas */}
                {selectedFiles.length > 0 && (
                  <div>
                    <Label>Imagens Selecionadas ({selectedFiles.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remover imagem"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Imagens já cadastradas (apenas modo edição) */}
                {isEditing && imagens.length > 0 && (
                  <div>
                    <Label>Imagens Cadastradas ({imagens.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {imagens.map((imagem) => (
                        <div key={imagem.id} className="relative group">
                          <img
                            src={imagem.url}
                            alt={imagem.textoAlternativo || "Imagem do produto"}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => deleteImage(imagem.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Excluir imagem"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            #{imagem.ordemExibicao}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botão para fazer upload em modo edição */}
                {isEditing && selectedFiles.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => uploadImages(id!)}
                    disabled={uploadingImages}
                    className="w-full"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando imagens...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar {selectedFiles.length} imagem(ns)
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/merchant/products")}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{isEditing ? "Salvar Alterações" : "Criar Produto"}</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
