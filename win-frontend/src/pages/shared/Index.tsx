import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Grid3X3,
  Package,
  Heart,
  Star,
  ShoppingCart,
  User,
  Loader2,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import { api } from "@/lib/Api";

const categories = [
  { name: "Ferragens", icon: "🔧", color: "bg-blue-100 text-blue-700" },
  { name: "Elétricos", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
  { name: "Limpeza", icon: "🧽", color: "bg-green-100 text-green-700" },
  { name: "Embalagens", icon: "📦", color: "bg-purple-100 text-purple-700" },
  { name: "Autopeças", icon: "🚗", color: "bg-red-100 text-red-700" },
];

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  lojista: {
    id: number;
    usuario: {
      nome: string;
    };
  };
  categoria: {
    id: number;
    nome: string;
  };
  imagens: Array<{
    id: number;
    urlImagem: string;
    imagemPrincipal: boolean;
  }>;
}

export default function Index() {
  const { state, addItem } = useCart();
  const { info, success, error } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Buscar produtos da API
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos', {
        params: {
          page: page,
          size: 8, // 8 produtos por página
        },
      });
      
      if (response.data.content) {
        // Filtrar apenas produtos ativos
        const produtosAtivos = response.data.content.filter((p: Produto) => p.ativo);
        setProdutos(produtosAtivos);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      error('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar produtos quando a página muda
  useEffect(() => {
    fetchProdutos();
  }, [page]);

  const handleAddToCart = (produto: Produto) => {
    addItem({
      id: produto.id,
      name: produto.nome,
      price: produto.preco,
      quantity: 1,
      image: getProductImage(produto),
      store: produto.lojista?.usuario?.nome || 'Lojista',
      inStock: produto.estoque > 0,
    });
    success(
      "Produto adicionado ao carrinho!",
      `${produto.nome} foi adicionado com sucesso.`,
    );
  };

  // Função para formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Função para obter URL da imagem principal
  const getProductImage = (produto: Produto) => {
    // Verificar se imagens existe e é um array
    if (!produto.imagens || !Array.isArray(produto.imagens) || produto.imagens.length === 0) {
      return '/placeholder.svg';
    }
    
    const imagemPrincipal = produto.imagens.find((img) => img.imagemPrincipal);
    if (imagemPrincipal) {
      return imagemPrincipal.urlImagem;
    }
    return produto.imagens[0].urlImagem;
  };

  // Função para lidar com clique em "Venda no WIN"
  const handleVendaClick = () => {
    // Se usuário já tem perfil LOJISTA, vai direto para dashboard
    if (user?.perfis?.includes("LOJISTA")) {
      navigate("/merchant/dashboard");
    } else {
      // Caso contrário, vai para página de cadastro/informações
      navigate("/sell");
    }
  };

  useEffect(() => {
    // Show welcome notification on first visit
    const hasVisited = localStorage.getItem("win-has-visited");
    if (!hasVisited) {
      setTimeout(() => {
        info(
          "Bem-vindo ao WIN Marketplace!",
          "Encontre produtos locais com entrega rápida",
        );
        localStorage.setItem("win-has-visited", "true");
      }, 1500);
    }
  }, [info]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Encontre tudo que precisa
            </h2>
            <p className="text-lg lg:text-xl mb-8 text-blue-100">
              Produtos locais com entrega rápida e frete grátis na primeira
              compra
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                Comece a Comprar
              </Button>
              <Button
                onClick={handleVendaClick}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Venda no WIN
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8">Categorias</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/category/${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {category.name}
                    </h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">
              Produtos Disponíveis
            </h3>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || loading}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando produtos...</span>
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nenhum produto disponível</h4>
              <p className="text-muted-foreground">
                Ainda não há produtos cadastrados. Volte em breve!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {produtos.map((produto) => (
                <Card
                  key={produto.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <Link to={`/product/${produto.id}`}>
                    <div className="relative cursor-pointer">
                      <img
                        src={getProductImage(produto)}
                        alt={produto.nome}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {produto.estoque === 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          Sem estoque
                        </Badge>
                      )}
                      {produto.estoque > 0 && produto.estoque <= 5 && (
                        <Badge className="absolute top-2 left-2 bg-orange-500">
                          Últimas unidades
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <CardContent className="p-4">
                    <Link to={`/product/${produto.id}`}>
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                        {produto.nome}
                      </h4>
                    </Link>
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {produto.categoria?.nome || 'Sem categoria'}
                      <span className="mx-2">•</span>
                      {produto.lojista?.usuario?.nome || 'Lojista'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(produto.preco)}
                      </span>
                      <Button
                        size="sm"
                        className="text-xs"
                        disabled={produto.estoque === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(produto);
                        }}
                      >
                        {produto.estoque === 0 ? 'Esgotado' : 'Adicionar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-primary"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/categories"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1">Categorias</span>
          </Link>
          <Link
            to="/cart"
            className="flex flex-col items-center justify-center text-muted-foreground relative"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Carrinho</span>
            <Badge className="absolute top-1 right-4 h-4 w-4 flex items-center justify-center p-0 text-xs">
              {state.itemCount}
            </Badge>
          </Link>
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Pedidos</span>
          </Link>
          <Link
            to="/login"
            className="flex flex-col items-center justify-center text-muted-foreground"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Conta</span>
          </Link>
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
