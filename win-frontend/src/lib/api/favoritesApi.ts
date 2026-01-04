import { api } from '../Api';

export interface Favorite {
  id: string;
  produtoId: string;
  nome: string;
  preco: number;
  imagem: string;
  emEstoque: boolean;
  lojista: {
    id: string;
    nomeFantasia: string;
  };
  dataCriacao: string;
}

class FavoritesApi {
  /**
   * Busca todos os favoritos do usuário autenticado
   */
  async getMyFavorites(): Promise<Favorite[]> {
    const response = await api.get('/v1/favoritos/meus');
    return response.data;
  }

  /**
   * Adiciona um produto aos favoritos
   */
  async addFavorite(produtoId: string): Promise<Favorite> {
    const response = await api.post('/v1/favoritos', { produtoId });
    return response.data;
  }

  /**
   * Remove um produto dos favoritos
   */
  async removeFavorite(produtoId: string): Promise<void> {
    await api.delete(`/v1/favoritos/${produtoId}`);
  }

  /**
   * Verifica se um produto está nos favoritos
   */
  async isFavorite(produtoId: string): Promise<boolean> {
    const response = await api.get(`/v1/favoritos/verifica/${produtoId}`);
    return response.data;
  }
}

export const favoritesApi = new FavoritesApi();
