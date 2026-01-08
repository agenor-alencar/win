import { useState, useEffect } from "react";

/**
 * Hook personalizado para debounce de valores
 * Útil para otimizar pesquisas e evitar chamadas excessivas à API
 * 
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Valor debounced
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Fazer pesquisa na API
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um timer que atualiza o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timeout se o valor mudar antes do delay
    // (cleanup function)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce com callback
 * Executa uma função após o delay
 * 
 * @param callback - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Função debounced
 * 
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   fetchResults(term);
 * }, 500);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Limpa o timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Cria um novo timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
