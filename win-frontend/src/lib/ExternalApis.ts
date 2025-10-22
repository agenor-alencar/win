/**
 * APIs Externas para auto-preenchimento de formulários
 * 
 * - ReceitaWS: Busca dados de CNPJ
 * - ViaCEP: Busca dados de CEP
 */

// ============= RECEITA WS (CNPJ) =============

export interface ReceitaWSResponse {
  status: string;
  cnpj: string;
  nome: string; // Razão Social
  fantasia: string; // Nome Fantasia
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string; // Cidade
  uf: string;
  situacao: string; // ATIVA, BAIXADA, SUSPENSA, INAPTA, NULA
  abertura: string; // Data de abertura
}

/**
 * Busca dados de uma empresa pelo CNPJ usando nosso backend como proxy
 * (Evita problemas de CORS)
 * 
 * @param cnpj - CNPJ com ou sem formatação
 * @returns Dados da empresa
 * @throws Error se CNPJ não for encontrado ou API falhar
 */
export async function buscarCNPJ(cnpj: string): Promise<ReceitaWSResponse> {
  // Remover formatação do CNPJ (deixar só números)
  const cnpjNumeros = cnpj.replace(/\D/g, '');
  
  if (cnpjNumeros.length !== 14) {
    throw new Error('CNPJ deve conter 14 dígitos');
  }
  
  try {
    // Usar nosso backend como proxy para evitar CORS
    const response = await fetch(
      `http://localhost:8080/api/v1/external/cnpj/${cnpjNumeros}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado na base da Receita Federal');
      }
      throw new Error('CNPJ não encontrado ou API indisponível');
    }
    
    const data: ReceitaWSResponse = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error('CNPJ inválido ou não encontrado');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Não foi possível buscar os dados do CNPJ. Tente novamente mais tarde.');
  }
}

// ============= VIA CEP =============

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean; // true se CEP não existe
}

/**
 * Busca dados de endereço pelo CEP usando nosso backend como proxy
 * (Evita problemas de CORS)
 * 
 * @param cep - CEP com ou sem formatação
 * @returns Dados do endereço
 * @throws Error se CEP não for encontrado ou API falhar
 */
export async function buscarCEP(cep: string): Promise<ViaCEPResponse> {
  // Remover formatação do CEP (deixar só números)
  const cepNumeros = cep.replace(/\D/g, '');
  
  if (cepNumeros.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos');
  }
  
  try {
    // Usar nosso backend como proxy para evitar CORS
    const response = await fetch(
      `http://localhost:8080/api/v1/external/cep/${cepNumeros}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CEP não encontrado');
      }
      throw new Error('CEP não encontrado ou API indisponível');
    }
    
    const data: ViaCEPResponse = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Não foi possível buscar os dados do CEP. Verifique e tente novamente.');
  }
}

// ============= FORMATADORES =============

/**
 * Formata CNPJ para o padrão XX.XXX.XXX/XXXX-XX
 */
export function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/\D/g, '');
  
  if (numeros.length !== 14) {
    return cnpj;
  }
  
  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Formata CEP para o padrão XXXXX-XXX
 */
export function formatarCEP(cep: string): string {
  const numeros = cep.replace(/\D/g, '');
  
  if (numeros.length !== 8) {
    return cep;
  }
  
  return numeros.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

/**
 * Formata telefone para o padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  
  return telefone;
}
