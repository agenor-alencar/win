import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Search, X, Loader2, History, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showHistory?: boolean;
  showSuggestions?: boolean;
  suggestions?: string[];
  isLoading?: boolean;
  debounceMs?: number;
  maxHistoryItems?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "filled";
}

const STORAGE_KEY = "win-search-history";

/**
 * Componente de pesquisa profissional com recursos avançados:
 * - Debounce automático para otimizar pesquisas
 * - Histórico de pesquisas (localStorage)
 * - Sugestões em tempo real
 * - Atalhos de teclado (Ctrl+K para focar, Escape para limpar)
 * - Loading states visuais
 * - Botão de limpar
 * - Acessibilidade completa (ARIA)
 * - Três tamanhos disponíveis
 * - Variantes de estilo
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Pesquisar...",
  className,
  autoFocus = false,
  showHistory = true,
  showSuggestions = true,
  suggestions = [],
  isLoading = false,
  debounceMs = 500,
  maxHistoryItems = 5,
  disabled = false,
  size = "md",
  variant = "default",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedValue = useDebounce(value, debounceMs);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carrega histórico do localStorage
  useEffect(() => {
    if (showHistory) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Erro ao carregar histórico de pesquisa:", e);
        }
      }
    }
  }, [showHistory]);

  // Executa pesquisa quando o valor debounced muda
  useEffect(() => {
    if (debouncedValue && onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Atalho de teclado: Ctrl+K ou Cmd+K para focar
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(newValue.length > 0 || (showHistory && searchHistory.length > 0));
  };

  const handleClear = () => {
    onChange("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    } else if (e.key === "Enter" && value.trim()) {
      handleSelectSuggestion(value);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);

    // Salva no histórico
    if (showHistory && suggestion.trim()) {
      const newHistory = [
        suggestion,
        ...searchHistory.filter((item) => item !== suggestion),
      ].slice(0, maxHistoryItems);
      
      setSearchHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }

    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Filtra sugestões baseado no valor atual
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  // Define classes baseado no tamanho
  const sizeClasses = {
    sm: "h-8 text-sm px-3",
    md: "h-10 text-base px-4",
    lg: "h-12 text-lg px-5",
  };

  // Define classes baseado na variante
  const variantClasses = {
    default: "border border-gray-300 bg-white",
    outlined: "border-2 border-gray-400 bg-transparent",
    filled: "border-0 bg-gray-100",
  };

  const shouldShowDropdown =
    showDropdown &&
    isFocused &&
    !disabled &&
    (filteredSuggestions.length > 0 || (value.length === 0 && searchHistory.length > 0));

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <div className="relative">
        {/* Ícone de pesquisa */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (value.length > 0 || searchHistory.length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "w-full rounded-lg pl-10 pr-10 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
            sizeClasses[size],
            variantClasses[variant],
            isFocused && "ring-2 ring-[#3DBEAB]/20"
          )}
          aria-label="Campo de pesquisa"
          aria-describedby="search-description"
          role="searchbox"
        />

        {/* Botão de limpar */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpar pesquisa"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Hint de atalho */}
        {!isFocused && !value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
              Ctrl+K
            </kbd>
          </div>
        )}
      </div>

      {/* Descrição oculta para acessibilidade */}
      <span id="search-description" className="sr-only">
        Digite para pesquisar. Use Ctrl+K para focar, Escape para limpar, Enter para pesquisar.
      </span>

      {/* Dropdown de sugestões e histórico */}
      {shouldShowDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Histórico */}
          {value.length === 0 && searchHistory.length > 0 && showHistory && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center text-xs font-medium text-gray-500">
                  <History className="h-3 w-3 mr-1" />
                  Pesquisas recentes
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Limpar
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm flex items-center transition-colors"
                >
                  <History className="h-4 w-4 mr-2 text-gray-400" />
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Sugestões */}
          {filteredSuggestions.length > 0 && showSuggestions && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center px-2 py-1 text-xs font-medium text-gray-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                Sugestões
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm flex items-center transition-colors"
                >
                  <Search className="h-4 w-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Mensagem de sem resultados */}
          {value.length > 0 &&
            filteredSuggestions.length === 0 &&
            !isLoading && (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhuma sugestão encontrada
              </div>
            )}
        </div>
      )}
    </div>
  );
};
