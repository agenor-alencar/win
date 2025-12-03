import { api } from "../Api";
import { AxiosError } from "axios";

/**
 * Classe base para todos os services de administração
 * Fornece métodos comuns e tratamento de erros unificado
 */
export abstract class AdminApi {
  protected readonly baseUrl: string = "/v1";

  /**
   * Tratamento unificado de erros
   */
  protected handleError(error: unknown, defaultMessage: string): never {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message || defaultMessage;
      throw new Error(message);
    }
    throw new Error(defaultMessage);
  }

  /**
   * Formata data para padrão brasileiro
   */
  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString("pt-BR");
  }

  /**
   * Formata data e hora para padrão brasileiro
   */
  protected formatDateTime(date: string): string {
    return new Date(date).toLocaleString("pt-BR");
  }

  /**
   * Formata valor monetário
   */
  protected formatCurrency(value: number): string {
    return value.toFixed(2);
  }
}

export { api };
