import { AdminApi, api } from "./AdminApi";

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  lojistaNome?: string;
  categoriaNome?: string;
  criadoEm: string;
}

export interface ProductFormatted {
  id: string;
  image: string;
  title: string;
  category: string;
  store: string;
  price: string;
  stock: number;
  status: "Ativo" | "Inativo" | "Sem estoque";
  createdAt: string;
  description: string;
  ativo: boolean;
}

export interface ProductStats {
  total: number;
  ativos: number;
  inativos: number;
  semEstoque: number;
}

class ProductApiService extends AdminApi {
  /**
   * Lista todos os produtos
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>(`${this.baseUrl}/produtos`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar produtos");
    }
  }

  /**
   * Lista produtos formatados para a tabela
   */
  async getFormattedProducts(): Promise<ProductFormatted[]> {
    try {
      const products = await this.getAllProducts();
      
      return products.map((produto) => {
        let status: ProductFormatted["status"] = "Ativo";
        if (!produto.ativo) status = "Inativo";
        else if (produto.estoque === 0) status = "Sem estoque";

        return {
          id: produto.id,
          image: "/products/placeholder.jpg",
          title: produto.nome,
          category: produto.categoriaNome || "Sem categoria",
          store: produto.lojistaNome || "Sem loja",
          price: this.formatCurrency(produto.preco),
          stock: produto.estoque,
          status,
          createdAt: this.formatDate(produto.criadoEm),
          description: produto.descricao || "-",
          ativo: produto.ativo,
        };
      });
    } catch (error) {
      this.handleError(error, "Erro ao buscar produtos formatados");
    }
  }

  /**
   * Busca estatísticas de produtos
   */
  async getStats(): Promise<ProductStats> {
    try {
      const products = await this.getFormattedProducts();
      
      return {
        total: products.length,
        ativos: products.filter((p) => p.status === "Ativo").length,
        inativos: products.filter((p) => p.status === "Inativo").length,
        semEstoque: products.filter((p) => p.stock === 0).length,
      };
    } catch (error) {
      this.handleError(error, "Erro ao buscar estatísticas de produtos");
    }
  }

  /**
   * Busca produto por ID
   */
  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`${this.baseUrl}/produtos/${productId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erro ao buscar produto");
    }
  }

  /**
   * Deleta um produto
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/produtos/${productId}`);
    } catch (error) {
      this.handleError(error, "Erro ao excluir produto");
    }
  }

  /**
   * Ativa um produto
   */
  async activateProduct(productId: string): Promise<void> {
    try {
      await api.put(
        `${this.baseUrl}/admin/produtos/${productId}/toggle-status`,
        null,
        { params: { ativar: true } }
      );
    } catch (error) {
      this.handleError(error, "Erro ao ativar produto");
    }
  }

  /**
   * Desativa um produto
   */
  async deactivateProduct(productId: string): Promise<void> {
    try {
      await api.put(
        `${this.baseUrl}/admin/produtos/${productId}/toggle-status`,
        null,
        { params: { ativar: false } }
      );
    } catch (error) {
      this.handleError(error, "Erro ao desativar produto");
    }
  }

  /**
   * Alterna status do produto
   */
  async toggleProductStatus(productId: string, isActive: boolean): Promise<void> {
    if (isActive) {
      await this.deactivateProduct(productId);
    } else {
      await this.activateProduct(productId);
    }
  }
}

export const productApi = new ProductApiService();
