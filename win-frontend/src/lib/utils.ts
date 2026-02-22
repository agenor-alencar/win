import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove caracteres não numéricos de uma string
 * Útil para limpar CPF, CNPJ, telefone, CEP antes de enviar ao backend
 */
export function removeNonNumeric(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Limpa dados do formulário de lojista/perfil removendo formatação
 */
export function cleanProfileData<T extends Record<string, any>>(
  data: T,
  numericFields: (keyof T)[]
): T {
  const cleaned = { ...data };
  
  numericFields.forEach((field) => {
    if (typeof cleaned[field] === "string") {
      cleaned[field] = removeNonNumeric(cleaned[field] as string) as T[keyof T];
    }
  });
  
  return cleaned;
}
