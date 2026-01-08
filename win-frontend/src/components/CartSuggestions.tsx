import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  nome: string;
  preco: number;
  precoOriginal?: number;
  imagemPrincipal?: string;
  estoque: number;
  avaliacao?: number;
  quantidadeAvaliacoes?: number;
  lojista: {
    id: string;
    nomeFantasia: string;
  };
}

interface CartSuggestionsProps {
  lojistaId?: string; // Opcional por enquanto
  lojistaName: string;
  excludeProductIds?: string[];
}

/**
 * Componente de sugestões de produtos da mesma loja no carrinho
 * Mostra produtos do mesmo lojista para incentivar compras adicionais
 */
export const CartSuggestions: React.FC<CartSuggestionsProps> = ({
  lojistaId,
  lojistaName,
  excludeProductIds = [],
}) => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (lojistaId) {
      loadSuggestions();
    } else {
      setLoading(false);
    }
  }, [lojistaId, excludeProductIds]);

  const loadSuggestions = async () => {
    if (!lojistaId) return;
    
    setLoading(true);
    try {
      const excludeParams = excludeProductIds.length > 0 
        ? `&excluirIds=${excludeProductIds.join('&excluirIds=')}` 
        : '';
      
      const response = await fetch(
        `/api/v1/produtos/lojista/${lojistaId}/sugestoes?limite=6${excludeParams}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Erro ao carregar sugestões:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.nome,
      price: product.preco,
      image: product.imagemPrincipal || "/placeholder-product.png",
      quantity: 1,
      store: product.lojista.nomeFantasia,
      lojistaId: product.lojista.id,
      inStock: product.estoque > 0,
    });
  };

  // Não renderiza nada se não houver lojistaId ou sugestões
  if (!lojistaId || (loading === false && suggestions.length === 0)) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Mais produtos de {lojistaName}
          </h2>
          <p className="text-sm text-gray-600">
            Aproveite e adicione mais itens da mesma loja
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {suggestions.map((product) => {
          const discount = product.precoOriginal
            ? Math.round(((product.precoOriginal - product.preco) / product.precoOriginal) * 100)
            : 0;

          return (
            <div
              key={product.id}
              className="group border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Imagem */}
              <Link to={`/product/${product.id}`} className="block relative">
                <img
                  src={product.imagemPrincipal || "/placeholder-product.png"}
                  alt={product.nome}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-product.png";
                  }}
                />
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{discount}%
                  </div>
                )}
              </Link>

              {/* Informações */}
              <div className="p-3">
                <Link
                  to={`/product/${product.id}`}
                  className="block hover:text-[#3DBEAB] transition-colors"
                >
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.nome}
                  </h3>
                </Link>

                {/* Avaliação */}
                {product.avaliacao && product.quantidadeAvaliacoes ? (
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">
                      {product.avaliacao.toFixed(1)} ({product.quantidadeAvaliacoes})
                    </span>
                  </div>
                ) : null}

                {/* Preço */}
                <div className="mb-2">
                  {product.precoOriginal && (
                    <p className="text-xs text-gray-400 line-through">
                      R$ {product.precoOriginal.toFixed(2)}
                    </p>
                  )}
                  <p className="text-base font-bold text-[#3DBEAB]">
                    R$ {product.preco.toFixed(2)}
                  </p>
                </div>

                {/* Botão Adicionar */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.estoque <= 0}
                  className="w-full py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white text-sm rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                  title={product.estoque <= 0 ? "Produto indisponível" : "Adicionar ao carrinho"}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">{product.estoque <= 0 ? "Indisponível" : "Adicionar"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Link para ver todos */}
      <div className="mt-4 text-center">
        <Link
          to={`/lojista/${lojistaId}/produtos`}
          className="text-[#3DBEAB] hover:text-[#2D9CDB] font-medium text-sm inline-flex items-center space-x-1"
        >
          <span>Ver todos os produtos de {lojistaName}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};
