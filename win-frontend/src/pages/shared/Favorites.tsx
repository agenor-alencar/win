import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Header from "../../components/Header";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import { produtoApi, type Produto } from "@/lib/produtoApi";

export default function Favorites() {
  const { addItem } = useCart();
  const { success, error, info } = useNotification();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteIds = JSON.parse(localStorage.getItem('win-favorites') || '[]');
      setFavorites(favoriteIds);

      if (favoriteIds.length === 0) {
        setLoading(false);
        return;
      }

      // Buscar detalhes dos produtos favoritos
      const produtosPromises = favoriteIds.map((id: string) => 
        produtoApi.buscarPorId(id).catch(() => null)
      );
      
      const produtosData = await Promise.all(produtosPromises);
      setProdutos(produtosData.filter(p => p !== null) as Produto[]);
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
      error('Erro', 'Não foi possível carregar seus favoritos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (productId: string) => {
    const newFavorites = favorites.filter(id => id !== productId);
    localStorage.setItem('win-favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    setProdutos(produtos.filter(p => p.id !== productId));
    info('Removido', 'Produto removido dos favoritos.');
  };

  const handleAddToCart = (produto: Produto) => {
    if (produto.estoque === 0) {
      error('Produto sem estoque', 'Este produto não está disponível no momento.');
      return;
    }

    addItem({
      id: produto.id,
      name: produto.nome,
      price: produto.preco,
      quantity: 1,
      image: produto.imagensUrls?.[0] || '/placeholder.svg',
      store: produto.lojista.nomeFantasia,
      lojistaId: produto.lojista.id,
      inStock: produto.estoque > 0,
    });
    success('Adicionado ao carrinho!', `${produto.nome} foi adicionado ao carrinho.`);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="h-8 w-8 mr-3 text-red-500 fill-red-500" />
                Meus Favoritos
              </h1>
              <p className="text-muted-foreground mt-2">
                {produtos.length} {produtos.length === 1 ? 'produto salvo' : 'produtos salvos'}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Favoritos */}
        {produtos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nenhum favorito ainda
              </h2>
              <p className="text-muted-foreground mb-6">
                Comece a adicionar produtos aos seus favoritos clicando no ícone ❤️
              </p>
              <Button asChild>
                <Link to="/">Explorar Produtos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <Link to={`/product/${produto.id}`}>
                  <div className="relative">
                    <img
                      src={produto.imagensUrls?.[0] || '/placeholder.svg'}
                      alt={produto.nome}
                      loading="lazy"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    {produto.estoque === 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        Esgotado
                      </Badge>
                    )}
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link to={`/product/${produto.id}`}>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px] hover:text-primary">
                      {produto.nome}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(produto.preco)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {produto.lojista.nomeFantasia}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFavorite(produto.id)}
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {produto.estoque > 0 
                      ? `${produto.estoque} ${produto.estoque === 1 ? 'unidade' : 'unidades'} disponível`
                      : 'Produto esgotado'
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
