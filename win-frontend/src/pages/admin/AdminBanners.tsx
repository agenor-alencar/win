import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { bannerApi, type Banner } from "@/lib/bannerApi";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    linkUrl: "",
    ordem: 1,
    ativo: true,
  });

  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  // Carregar banners
  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerApi.listarTodosBanners();
      setBanners(data);
      
      // Calcular estatísticas
      setStats({
        total: data.length,
        ativos: data.filter(b => b.ativo).length,
        inativos: data.filter(b => !b.ativo).length,
      });
    } catch (error: any) {
      console.error("Erro ao carregar banners:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      titulo: "",
      subtitulo: "",
      linkUrl: "",
      ordem: banners.length + 1,
      ativo: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      titulo: banner.titulo,
      subtitulo: banner.subtitulo || "",
      linkUrl: banner.linkUrl || "",
      ordem: banner.ordem,
      ativo: banner.ativo,
    });
    setSelectedFile(null);
    setPreviewUrl(banner.imagemUrl);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBanner && !selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem para o banner",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingBanner) {
        // Atualizar banner existente
        await bannerApi.atualizarBanner(editingBanner.id, formData);
        
        // Se houver nova imagem, atualizar
        if (selectedFile) {
          await bannerApi.atualizarImagemBanner(editingBanner.id, selectedFile);
        }
        
        toast({
          title: "Sucesso",
          description: "Banner atualizado com sucesso!",
        });
      } else {
        // Criar novo banner
        if (selectedFile) {
          await bannerApi.criarBanner(formData, selectedFile);
          toast({
            title: "Sucesso",
            description: "Banner criado com sucesso!",
          });
        }
      }

      setShowModal(false);
      loadBanners();
    } catch (error: any) {
      console.error("Erro ao salvar banner:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar banner",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAtivo = async (banner: Banner) => {
    try {
      await bannerApi.toggleAtivo(banner.id);
      toast({
        title: "Sucesso",
        description: `Banner ${banner.ativo ? 'desativado' : 'ativado'} com sucesso!`,
      });
      loadBanners();
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do banner",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Tem certeza que deseja excluir o banner "${banner.titulo}"?`)) {
      return;
    }

    try {
      await bannerApi.deletarBanner(banner.id);
      toast({
        title: "Sucesso",
        description: "Banner excluído com sucesso!",
      });
      loadBanners();
    } catch (error: any) {
      console.error("Erro ao excluir banner:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir banner",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie os banners do carrossel da página inicial
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Novo Banner
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="truncate text-sm font-medium text-gray-500">Total de Banners</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="truncate text-sm font-medium text-gray-500">Banners Ativos</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
              {stats.ativos}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <div className="truncate text-sm font-medium text-gray-500">Banners Inativos</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-500">
              {stats.inativos}
            </div>
          </div>
        </div>

        {/* Lista de Banners */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Carregando banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="p-8 text-center">
              <PhotoIcon className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Nenhum banner cadastrado</p>
              <Button onClick={handleCreate} className="mt-4">
                Criar primeiro banner
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {banners.map((banner) => (
                <div key={banner.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Imagem */}
                    <img
                      src={banner.imagemUrl}
                      alt={banner.titulo}
                      className="w-32 h-20 object-cover rounded-lg shadow-sm"
                    />

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {banner.titulo}
                        </h3>
                        <span className="text-sm text-gray-500">
                          (Ordem: {banner.ordem})
                        </span>
                        {banner.ativo ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Inativo
                          </span>
                        )}
                      </div>
                      {banner.subtitulo && (
                        <p className="text-sm text-gray-600 mb-2">{banner.subtitulo}</p>
                      )}
                      {banner.linkUrl && (
                        <p className="text-xs text-gray-500">
                          Link: <span className="text-blue-600">{banner.linkUrl}</span>
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAtivo(banner)}
                        title={banner.ativo ? "Desativar" : "Ativar"}
                      >
                        {banner.ativo ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(banner)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AdminModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingBanner ? "Editar Banner" : "Novo Banner"}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Ferragens e Ferramentas"
                required
              />
            </div>

            {/* Subtítulo */}
            <div>
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Textarea
                id="subtitulo"
                value={formData.subtitulo}
                onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                placeholder="Ex: As melhores marcas: Ingco, Bosch, Makita"
                rows={2}
              />
            </div>

            {/* Link */}
            <div>
              <Label htmlFor="linkUrl">Link de Destino</Label>
              <Input
                id="linkUrl"
                type="text"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="Ex: /categoria/ferragens"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL para onde o usuário será direcionado ao clicar no banner
              </p>
            </div>

            {/* Ordem */}
            <div>
              <Label htmlFor="ordem">Ordem de Exibição *</Label>
              <Input
                id="ordem"
                type="number"
                min="1"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Menor número = exibido primeiro
              </p>
            </div>

            {/* Ativo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Banner ativo (visível na home)
              </Label>
            </div>

            {/* Upload de Imagem */}
            <div>
              <Label htmlFor="imagem">
                Imagem {!editingBanner && "*"}
              </Label>
              <Input
                id="imagem"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingBanner}
              />
              <p className="mt-1 text-xs text-gray-500">
                Dimensões recomendadas: 1920x500px | Máximo: 10MB
              </p>

              {/* Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingBanner ? "Atualizar" : "Criar Banner"
                )}
              </Button>
            </div>
          </form>
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
