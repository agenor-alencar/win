/**
 * EXEMPLO DE INTEGRAÇÃO DO SEARCHINPUT NO HEADER
 * 
 * Este arquivo demonstra como integrar o novo componente SearchInput
 * no header da aplicação, substituindo o input padrão.
 * 
 * Para aplicar estas mudanças:
 * 1. Copie o código abaixo
 * 2. Substitua a seção de pesquisa no arquivo Header.tsx
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "@/components/SearchInput";
import { useSearch } from "@/contexts/SearchContext";

export function HeaderSearchExample() {
  const navigate = useNavigate();
  const { searchProducts, isSearching } = useSearch();
  const [searchQuery, setSearchQuery] = useState("");

  // Sugestões populares para o dropdown
  const popularSearches = [
    "Ferramentas elétricas",
    "Materiais de construção",
    "Tintas e acabamentos",
    "Ferragens",
    "Iluminação",
    "Hidráulica",
    "Elétrica",
    "Jardim e decoração"
  ];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navega para a página de resultados com o termo de pesquisa
      navigate(`/search?q=${encodeURIComponent(query)}`);
      
      // Executa a pesquisa
      searchProducts(query);
    }
  };

  return (
    <>
      {/* Desktop Search */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Buscar produtos, lojas..."
          isLoading={isSearching}
          showHistory={true}
          showSuggestions={true}
          suggestions={popularSearches}
          debounceMs={500}
          size="lg"
          variant="default"
          autoFocus={false}
        />
      </div>

      {/* Mobile Search */}
      <div className="md:hidden pb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Buscar produtos..."
          isLoading={isSearching}
          showHistory={true}
          showSuggestions={true}
          suggestions={popularSearches}
          debounceMs={500}
          size="md"
          variant="default"
        />
      </div>
    </>
  );
}

/**
 * INSTRUÇÕES DE INTEGRAÇÃO NO HEADER.TSX:
 * 
 * 1. Importe o SearchInput:
 *    import { SearchInput } from "@/components/SearchInput";
 *    import { useSearch } from "@/contexts/SearchContext";
 * 
 * 2. No componente Header, adicione:
 *    const { searchProducts, isSearching } = useSearch();
 * 
 * 3. Substitua a seção de pesquisa desktop (linha ~128):
 * 
 *    // ANTES:
 *    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
 *      <form onSubmit={handleSearch} className="relative w-full">
 *        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 *        <Input
 *          placeholder="Buscar produtos, lojas..."
 *          value={searchQuery}
 *          onChange={(e) => setSearchQuery(e.target.value)}
 *          className="pl-10 h-12"
 *        />
 *        <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
 *          Buscar
 *        </Button>
 *      </form>
 *    </div>
 * 
 *    // DEPOIS:
 *    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
 *      <SearchInput
 *        value={searchQuery}
 *        onChange={setSearchQuery}
 *        onSearch={handleSearch}
 *        placeholder="Buscar produtos, lojas..."
 *        isLoading={isSearching}
 *        showHistory={true}
 *        showSuggestions={true}
 *        suggestions={[
 *          "Ferramentas elétricas",
 *          "Materiais de construção",
 *          "Tintas e acabamentos",
 *          "Ferragens",
 *          "Iluminação",
 *          "Hidráulica"
 *        ]}
 *        size="lg"
 *      />
 *    </div>
 * 
 * 4. Substitua a pesquisa mobile (linha ~192):
 * 
 *    // ANTES:
 *    <div className="md:hidden pb-4">
 *      <form onSubmit={handleSearch} className="relative">
 *        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 *        <Input
 *          placeholder="Buscar produtos..."
 *          value={searchQuery}
 *          onChange={(e) => setSearchQuery(e.target.value)}
 *          className="pl-10 pr-20"
 *        />
 *        <Button type="submit" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
 *          Buscar
 *        </Button>
 *      </form>
 *    </div>
 * 
 *    // DEPOIS:
 *    <div className="md:hidden pb-4">
 *      <SearchInput
 *        value={searchQuery}
 *        onChange={setSearchQuery}
 *        onSearch={handleSearch}
 *        placeholder="Buscar produtos..."
 *        isLoading={isSearching}
 *        showHistory={true}
 *        showSuggestions={true}
 *        suggestions={[
 *          "Ferramentas elétricas",
 *          "Materiais de construção",
 *          "Tintas e acabamentos"
 *        ]}
 *        size="md"
 *      />
 *    </div>
 * 
 * 5. Atualize a função handleSearch para:
 * 
 *    const handleSearch = (query: string) => {
 *      if (query.trim()) {
 *        navigate(`/search?q=${encodeURIComponent(query)}`);
 *        searchProducts(query);
 *      }
 *    };
 * 
 * BENEFÍCIOS DA INTEGRAÇÃO:
 * ✅ Debounce automático (economia de requisições)
 * ✅ Histórico de pesquisas (melhor UX)
 * ✅ Sugestões inteligentes (descoberta de produtos)
 * ✅ Loading states (feedback visual)
 * ✅ Atalhos de teclado (Ctrl+K, Escape)
 * ✅ Acessibilidade completa
 * ✅ Design consistente com o resto da aplicação
 */
