import { api } from "./Api";

const API_BASE_URL = "/api/v1";

export interface Category {
  id: string;
  nome: string;
  descricao: string;
  categoriaPaiId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  subcategorias?: Category[];
}

export interface CategoryCreateRequest {
  nome: string;
  descricao?: string;
}

class CategoryApiService {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(`${API_BASE_URL}/categoria/list/all`);
    return response.data;
  }

  async getMainCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(`${API_BASE_URL}/categoria/list/principais`);
    return response.data;
  }

  async getSubCategories(categoryId: string): Promise<Category[]> {
    const response = await api.get<Category[]>(`${API_BASE_URL}/categoria/list/sub/${categoryId}`);
    return response.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<Category>(`${API_BASE_URL}/categoria/list/id/${id}`);
    return response.data;
  }

  async searchCategoriesByName(name: string): Promise<Category[]> {
    const response = await api.get<Category[]>(`${API_BASE_URL}/categoria/list/nome`, {
      params: { nome: name }
    });
    return response.data;
  }

  async createCategory(data: CategoryCreateRequest): Promise<Category> {
    const response = await api.post<Category>(`${API_BASE_URL}/categoria/create`, data);
    return response.data;
  }

  async createSubCategory(parentId: string, data: CategoryCreateRequest): Promise<Category> {
    const response = await api.post<Category>(`${API_BASE_URL}/categoria/create/sub/${parentId}`, data);
    return response.data;
  }

  async updateCategory(id: string, data: CategoryCreateRequest): Promise<Category> {
    const response = await api.put<Category>(`${API_BASE_URL}/categoria/update/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`${API_BASE_URL}/categoria/delete/${id}`);
  }

  async getCategoryStats() {
    const allCategories = await this.getAllCategories();
    const mainCategories = await this.getMainCategories();
    return {
      total: allCategories.length,
      principais: mainCategories.length,
      subcategorias: allCategories.length - mainCategories.length
    };
  }
}

export const categoryApi = new CategoryApiService();
