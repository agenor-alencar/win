import { api } from "./Api";

/**
 * Interface para Banner
 */
export interface Banner {
  id: string;
  titulo: string;
  subtitulo?: string;
  imagemUrl: string;
  linkUrl?: string;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * DTO para criação de banner
 */
export interface BannerCreateRequest {
  titulo: string;
  subtitulo?: string;
  linkUrl?: string;
  ordem: number;
  ativo?: boolean;
}

/**
 * DTO para atualização de banner
 */
export interface BannerUpdateRequest {
  titulo?: string;
  subtitulo?: string;
  linkUrl?: string;
  ordem?: number;
  ativo?: boolean;
}

/**
 * API de banners
 */
export const bannerApi = {
  /**
   * Lista banners ativos (público)
   */
  listarBannersAtivos: async (): Promise<Banner[]> => {
    const response = await api.get<Banner[]>("/v1/banners");
    return response.data;
  },

  /**
   * Lista todos os banners (admin)
   */
  listarTodosBanners: async (): Promise<Banner[]> => {
    const response = await api.get<Banner[]>("/v1/admin/banners");
    return response.data;
  },

  /**
   * Busca um banner por ID (admin)
   */
  buscarPorId: async (id: string): Promise<Banner> => {
    const response = await api.get<Banner>(`/v1/admin/banners/${id}`);
    return response.data;
  },

  /**
   * Cria um novo banner com upload de imagem (admin)
   */
  criarBanner: async (
    dados: BannerCreateRequest,
    arquivo: File
  ): Promise<Banner> => {
    const formData = new FormData();
    formData.append("file", arquivo);
    formData.append("titulo", dados.titulo);
    if (dados.subtitulo) formData.append("subtitulo", dados.subtitulo);
    if (dados.linkUrl) formData.append("linkUrl", dados.linkUrl);
    formData.append("ordem", dados.ordem.toString());
    formData.append("ativo", (dados.ativo !== false).toString());

    const response = await api.post<Banner>(
      "/v1/admin/banners",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Atualiza dados de um banner (admin)
   */
  atualizarBanner: async (
    id: string,
    dados: BannerUpdateRequest
  ): Promise<Banner> => {
    const response = await api.put<Banner>(
      `/v1/admin/banners/${id}`,
      dados
    );
    return response.data;
  },

  /**
   * Atualiza apenas a imagem de um banner (admin)
   */
  atualizarImagemBanner: async (id: string, arquivo: File): Promise<Banner> => {
    const formData = new FormData();
    formData.append("file", arquivo);

    const response = await api.put<Banner>(
      `/v1/admin/banners/${id}/imagem`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Ativa/desativa um banner (admin)
   */
  toggleAtivo: async (id: string): Promise<Banner> => {
    const response = await api.patch<Banner>(
      `/v1/admin/banners/${id}/toggle`
    );
    return response.data;
  },

  /**
   * Deleta um banner (admin)
   */
  deletarBanner: async (id: string): Promise<void> => {
    await api.delete(`/v1/admin/banners/${id}`);
  },
};
