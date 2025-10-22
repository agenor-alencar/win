/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata CPF: 12345678910 -> 123.456.789-10
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length !== 11) return value;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação do CPF: 123.456.789-10 -> 12345678910
 */
export function unformatCPF(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Formata telefone: 61995334141 -> (61) 99533-4141
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 11) {
    // Celular: (00) 00000-0000
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return value;
}

/**
 * Remove formatação do telefone
 */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida senha: deve conter pelo menos 1 minúscula, 1 maiúscula e 1 número
 */
export function validatePassword(password: string): boolean {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

/**
 * Aplica máscara de CPF enquanto o usuário digita
 */
export function maskCPF(value: string): string {
  let numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  numbers = numbers.substring(0, 11);
  
  // Aplica a máscara gradualmente
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  } else if (numbers.length <= 9) {
    return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  }
}

/**
 * Aplica máscara de telefone enquanto o usuário digita
 */
export function maskPhone(value: string): string {
  let numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  numbers = numbers.substring(0, 11);
  
  // Aplica a máscara gradualmente
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  } else if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
}
