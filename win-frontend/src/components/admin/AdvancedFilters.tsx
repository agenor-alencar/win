import React from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

export interface ActiveFilter {
  filterId: string;
  value: string;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  activeFilters: Record<string, string>;
  onFilterChange: (filterId: string, value: string) => void;
  onClearFilters: () => void;
  className?: string;
  showClearButton?: boolean;
}

/**
 * Componente de filtros avançados para tabelas e listas
 * 
 * Features:
 * - Múltiplos filtros simultâneos
 * - Botão para limpar todos os filtros
 * - Badge mostrando número de filtros ativos
 * - Design responsivo
 * - Fácil integração
 * 
 * @example
 * const filters = [
 *   {
 *     id: 'category',
 *     label: 'Categoria',
 *     options: [
 *       { label: 'Todas', value: 'all' },
 *       { label: 'Eletrônicos', value: 'eletronicos' }
 *     ]
 *   }
 * ];
 * 
 * const [activeFilters, setActiveFilters] = useState({ category: 'all' });
 * 
 * <AdvancedFilters
 *   filters={filters}
 *   activeFilters={activeFilters}
 *   onFilterChange={(id, value) => setActiveFilters(prev => ({ ...prev, [id]: value }))}
 *   onClearFilters={() => setActiveFilters({ category: 'all' })}
 * />
 */
export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
  showClearButton = true,
}) => {
  // Conta quantos filtros estão ativos (não são "all" ou o valor padrão)
  const activeFilterCount = Object.entries(activeFilters).filter(
    ([filterId, value]) => {
      const filter = filters.find((f) => f.id === filterId);
      const defaultValue = filter?.defaultValue || "all";
      return value !== defaultValue && value !== "all";
    }
  ).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com contador e botão limpar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-[#3DBEAB] rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
        </div>

        {showClearButton && hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      {/* Grid de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filters.map((filter) => {
          const currentValue = activeFilters[filter.id] || filter.defaultValue || "all";
          const isActive = currentValue !== "all" && currentValue !== filter.defaultValue;

          return (
            <div key={filter.id} className="space-y-1">
              <label
                htmlFor={`filter-${filter.id}`}
                className="block text-sm font-medium text-gray-700"
              >
                {filter.label}
              </label>
              <div className="relative">
                <select
                  id={`filter-${filter.id}`}
                  value={currentValue}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent",
                    "appearance-none bg-white cursor-pointer",
                    isActive
                      ? "border-[#3DBEAB] bg-[#3DBEAB]/5 font-medium"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  aria-label={`Filtrar por ${filter.label}`}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {/* Ícone de seta customizado */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-[#3DBEAB]" : "text-gray-400"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo de filtros ativos (opcional) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500 font-medium">Filtros ativos:</span>
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find((f) => f.id === filterId);
            const defaultValue = filter?.defaultValue || "all";
            
            if (!filter || value === defaultValue || value === "all") {
              return null;
            }

            const option = filter.options.find((o) => o.value === value);
            if (!option) return null;

            return (
              <div
                key={filterId}
                className="inline-flex items-center px-2 py-1 bg-[#3DBEAB]/10 text-[#3DBEAB] rounded-md text-xs font-medium"
              >
                <span className="text-gray-600 mr-1">{filter.label}:</span>
                {option.label}
                <button
                  onClick={() => onFilterChange(filterId, defaultValue)}
                  className="ml-1 hover:bg-[#3DBEAB]/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remover filtro ${filter.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
