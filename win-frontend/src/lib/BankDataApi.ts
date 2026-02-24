import { api } from "./Api";

/**
 * Request DTO para cadastro de dados bancários
 */
export interface DadosBancariosRequest {
  titularNome: string;
  titularDocumento: string;
  titularTipo: "individual" | "company";
  codigoBanco: string;
  agencia: string;
  agenciaDv?: string;
  conta: string;
  contaDv?: string;
  tipoConta: "conta_corrente" | "conta_poupanca" | "conta_corrente_conjunta" | "conta_poupanca_conjunta";
}

/**
 * Response DTO com dados mascarados
 */
export interface DadosBancariosResponse {
  id: number;
  lojistaId: number;
  titularNome: string;
  titularDocumento: string; // Mascarado: ***.456.789-**
  titularTipo: string;
  codigoBanco: string;
  nomeBanco?: string;
  agencia: string;
  agenciaDv?: string;
  conta: string; // Mascarado: ****5-6
  contaDv?: string;
  tipoConta: string;
  validado: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Resposta da API após cadastro/atualização
 */
export interface CadastroResponse {
  mensagem: string;
  dadosBancarios: DadosBancariosResponse;
  recipientId?: string;
  status: "sucesso" | "pendente" | "erro";
}

/**
 * API client para gerenciamento de dados bancários do lojista
 */
export const BankDataApi = {
  /**
   * Cadastra ou atualiza dados bancários de um lojista
   * Cria automaticamente o recipient no Pagar.me
   */
  cadastrarDadosBancarios: async (
    lojistaId: number,
    dados: DadosBancariosRequest
  ): Promise<CadastroResponse> => {
    const response = await api.post<CadastroResponse>(
      `/v1/lojistas/${lojistaId}/dados-bancarios`,
      dados
    );
    return response.data;
  },

  /**
   * Busca dados bancários cadastrados (com dados mascarados)
   */
  buscarDadosBancarios: async (
    lojistaId: number
  ): Promise<DadosBancariosResponse> => {
    const response = await api.get<DadosBancariosResponse>(
      `/v1/lojistas/${lojistaId}/dados-bancarios`
    );
    return response.data;
  },

  /**
   * Recria o recipient no Pagar.me (caso tenha falhado anteriormente)
   */
  recriarRecipient: async (lojistaId: number): Promise<CadastroResponse> => {
    const response = await api.post<CadastroResponse>(
      `/v1/lojistas/${lojistaId}/dados-bancarios/recriar-recipient`
    );
    return response.data;
  },
};

/**
 * Lista de bancos brasileiros mais comuns
 */
export const BANCOS_BRASILEIROS = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "033", nome: "Santander" },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "341", nome: "Itaú" },
  { codigo: "077", nome: "Banco Inter" },
  { codigo: "260", nome: "Nubank" },
  { codigo: "336", nome: "Banco C6" },
  { codigo: "290", nome: "PagSeguro" },
  { codigo: "323", nome: "Mercado Pago" },
  { codigo: "380", nome: "PicPay" },
  { codigo: "212", nome: "Banco Original" },
  { codigo: "422", nome: "Banco Safra" },
  { codigo: "752", nome: "Banco BNP Paribas" },
  { codigo: "070", nome: "Banco de Brasília (BRB)" },
];
