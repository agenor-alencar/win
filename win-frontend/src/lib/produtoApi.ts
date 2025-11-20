import { api } from "./Api";

export interface Lojista {
  id: string;
  nomeFantasia: string;
  cnpj: string;
}

export interface Categoria {
  id: string;
  nome: string;
}

export interface Produto {
  id: string;
  lojista: Lojista;
  categoria: Categoria;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  pesoKg: number;
  comprimentoCm: number;
  larguraCm: number;
  alturaCm: number;
  ativo: boolean;
  avaliacao?: number;
  quantidadeAvaliacoes: number;
  imagensUrls: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProdutoSummary {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  avaliacao?: number;
  quantidadeAvaliacoes: number;
  imagemPrincipal?: string;
  nomeCategoria: string;
  nomeLojista: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const produtoApi = {
  /**
   * Lista produtos com paginação
   */
  listarProdutos: async (page = 0, size = 20): Promise<PageResponse<ProdutoSummary>> => {
    const response = await api.get(`/v1/produtos?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Busca produto por ID
   */
  buscarPorId: async (id: string): Promise<Produto> => {
    const response = await api.get(`/v1/produtos/${id}`);
    return response.data;
  },

  /**
   * Lista produtos de uma categoria
   */
  listarPorCategoria: async (categoriaId: string): Promise<Produto[]> => {
    const response = await api.get(`/v1/produtos/categoria/${categoriaId}`);
    return response.data;
  },

  /**
   * Busca produtos por nome
   */
  buscarPorNome: async (nome: string): Promise<Produto[]> => {
    const response = await api.get(`/v1/produtos/buscar?nome=${encodeURIComponent(nome)}`);
    return response.data;
  },

  /**
   * Lista produtos de um lojista
   */
  listarPorLojista: async (lojistaId: string): Promise<Produto[]> => {
    const response = await api.get(`/v1/produtos/lojista/${lojistaId}`);
    return response.data;
  },

  /**
   * Produtos em destaque (ordenados por avaliação)
   */
  listarDestaques: async (limit = 10): Promise<ProdutoSummary[]> => {
    const response = await api.get(`/v1/produtos?size=${limit}&sort=avaliacaoMedia,desc`);
    return response.data.content;
  },

  /**
   * Produtos em promoção
   */
  listarPromocoes: async (limit = 10): Promise<ProdutoSummary[]> => {
    const response = await api.get(`/v1/produtos/promocoes?size=${limit}`);
    return response.data.content || response.data;
  },
};
