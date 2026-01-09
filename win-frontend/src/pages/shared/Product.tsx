import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import { produtoApi, type Produto } from "@/lib/produtoApi";
import { getImageUrl, api } from "@/lib/Api";
import Header from "../../components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  MapPin,
  Clock,
  Truck,
  Shield,
  User,
  Home,
  Grid3X3,
  Package,
  Loader2,
} from "lucide-react";

interface ProdutoSugestao {
  id: string;
  nome: string;
  preco: number;
  imagemPrincipal: string;
  estoque: number;
  lojistaId: string;
  nomeLojista: string;
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, state } = useCart();
  const { success, error, info } = useNotification();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sugestoes, setSugestoes] = useState<ProdutoSugestao[]>([]);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);

  // Verificar se o produto está favoritado ao carregar
  useEffect(() => {
    if (id) {
      const favorites = JSON.parse(localStorage.getItem('win-favorites') || '[]');
      setIsFavorite(favorites.includes(id));
    }
  }, [id]);

  // Buscar produto da API
  useEffect(() => {
    const fetchProduto = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await produtoApi.buscarPorId(id);
        setProduto(data);
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        error('Erro', 'Não foi possível carregar o produto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id]);

  // Buscar sugestões de produtos da mesma loja
  useEffect(() => {
    const fetchSugestoes = async () => {
      if (!produto?.lojista?.id || !id) return;
      
      try {
        setLoadingSugestoes(true);
        
        // Corrigir a URL da API - remover /api duplicado e usar query params corretos
        const response = await api.get(
          `/v1/produtos/lojista/${produto.lojista.id}/sugestoes`,
          {
            params: {
              excluirIds: [id], // Backend espera array de UUIDs
              limite: 4
            }
          }
        );
        
        setSugestoes(response.data);
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
      } finally {
        setLoadingSugestoes(false);
      }
    };

    fetchSugestoes();
  }, [produto?.lojista?.id, id]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleToggleFavorite = () => {
    if (!id) return;
    
    const favorites = JSON.parse(localStorage.getItem('win-favorites') || '[]');
    let newFavorites: string[];
    
    if (isFavorite) {
      // Remover dos favoritos
      newFavorites = favorites.filter((favId: string) => favId !== id);
      info('Removido dos favoritos', `${produto?.nome} foi removido da sua lista de favoritos.`);
    } else {
      // Adicionar aos favoritos
      newFavorites = [...favorites, id];
      success('Adicionado aos favoritos!', `${produto?.nome} foi adicionado à sua lista de favoritos.`);
    }
    
    localStorage.setItem('win-favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (!produto) return;
    
    const shareData = {
      title: produto.nome,
      text: `Confira ${produto.nome} por ${formatPrice(produto.preco)} no WIN Marketplace!`,
      url: window.location.href,
    };

    try {
      // Verificar se o navegador suporta Web Share API
      if (navigator.share) {
        await navigator.share(shareData);
        success('Compartilhado!', 'Produto compartilhado com sucesso.');
      } else {
        // Fallback: copiar link para clipboard
        await navigator.clipboard.writeText(window.location.href);
        success('Link copiado!', 'O link do produto foi copiado para sua área de transferência.');
      }
    } catch (err) {
      // Usuário cancelou o compartilhamento ou houve erro
      if ((err as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
        error('Erro', 'Não foi possível compartilhar o produto.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Button asChild>
            <Link to="/">Voltar à Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = produto.imagensUrls && produto.imagensUrls.length > 0 
    ? produto.imagensUrls.map(url => getImageUrl(url))
    : ['/placeholder.svg'];

  const handleAddToCart = () => {
    if (produto.estoque === 0) {
      error('Produto esgotado', 'Este produto não está disponível no momento.');
      return;
    }

    if (quantity > produto.estoque) {
      error('Quantidade indisponível', `Apenas ${produto.estoque} unidades disponíveis.`);
      return;
    }

    addItem({
      id: produto.id,
      name: produto.nome,
      price: produto.preco,
      image: images[0],
      store: produto.lojista.nomeFantasia,
      lojistaId: produto.lojista.id,
      inStock: produto.estoque > 0,
      quantity,
    });
    success(
      "Produto adicionado!",
      `${quantity}x ${produto.nome} adicionado ao carrinho`,
    );
  };

  const handleBuyNow = () => {
    if (produto.estoque === 0) {
      error('Produto esgotado', 'Este produto não está disponível no momento.');
      return;
    }

    handleAddToCart();
    setTimeout(() => {
      navigate("/cart");
    }, 500);
  };

  const specifications = [
    { label: "Categoria", value: produto.categoria.nome },
    { label: "Peso", value: `${produto.pesoKg} kg` },
    { label: "Dimensões", value: `${produto.comprimentoCm} x ${produto.larguraCm} x ${produto.alturaCm} cm` },
    { label: "Estoque", value: `${produto.estoque} unidades` },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Padrão */}
      <Header showCategories={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImage]}
                alt={produto.nome}
                loading="eager"
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {produto.estoque === 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500">
                  Esgotado
                </Badge>
              )}
              {produto.estoque > 0 && produto.estoque <= 5 && (
                <Badge className="absolute top-4 left-4 bg-orange-500">
                  Últimas {produto.estoque} unidades
                </Badge>
              )}
            </div>

            {/* Image Thumbnails */}
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${produto.nome} ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{produto.nome}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {produto.avaliacao ? produto.avaliacao.toFixed(1) : '0.0'} ({produto.quantidadeAvaliacoes} avaliações)
                </div>
                <div className="flex items-center">
                  <Badge variant="outline">{produto.categoria.nome}</Badge>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(produto.preco)}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantidade:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    min="1"
                    max={produto.estoque}
                    value={quantity}
                    title="Quantidade"
                    placeholder="1"
                    aria-label="Quantidade do produto"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, value), produto.estoque));
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value < 1) setQuantity(1);
                      else if (value > produto.estoque) setQuantity(produto.estoque);
                    }}
                    className="px-4 py-2 text-center min-w-12 w-16 focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] rounded"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(produto.estoque, quantity + 1))}
                    disabled={quantity >= produto.estoque}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {produto.estoque} unidades disponíveis
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleBuyNow}
                disabled={produto.estoque === 0}
              >
                {produto.estoque === 0 ? 'Produto Esgotado' : 'Comprar Agora'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={produto.estoque === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {produto.estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
              </Button>
              
              {/* Botões de Ações Secundárias */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleFavorite}
                  className="w-full"
                >
                  <Heart className={`h-4 w-4 mr-2 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center text-sm">
                  <Truck className="h-4 w-4 mr-2 text-green-600" />
                  <span>Frete grátis na primeira compra</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Entrega em até 2 horas</span>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Garantia de qualidade WIN</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Store Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{produto.lojista.nomeFantasia}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>CNPJ: {produto.lojista.cnpj}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline">Ver Loja</Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Description */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Descrição do Produto</h3>
            <p className="text-muted-foreground leading-relaxed">
              {produto.descricao}
            </p>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Especificações</h3>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2">
                  <span className="text-muted-foreground">{spec.label}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section  - To be implemented with real API */}
        {produto.quantidadeAvaliacoes > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">
                Avaliações ({produto.quantidadeAvaliacoes})
              </h3>
              <p className="text-muted-foreground text-center py-8">
                Sistema de avaliações em desenvolvimento
              </p>
            </CardContent>
          </Card>
        )}

        {/* Produtos Sugeridos da Mesma Loja */}
        {sugestoes.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">
                Mais produtos de {produto.lojista.nomeFantasia}
              </h3>
              
              {loadingSugestoes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sugestoes.map((sugestao) => (
                    <Link
                      key={sugestao.id}
                      to={`/product/${sugestao.id}`}
                      className="group block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrl(sugestao.imagemPrincipal)}
                            alt={sugestao.nome}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          {sugestao.estoque === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-semibold">Esgotado</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">
                            {sugestao.nome}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(sugestao.preco)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                if (sugestao.estoque > 0) {
                                  addItem({
                                    id: sugestao.id,
                                    name: sugestao.nome,
                                    price: sugestao.preco,
                                    image: getImageUrl(sugestao.imagemPrincipal),
                                    store: sugestao.nomeLojista,
                                    lojistaId: sugestao.lojistaId,
                                    inStock: sugestao.estoque > 0,
                                    quantity: 1,
                                  });
                                  success('Produto adicionado!', `${sugestao.nome} foi adicionado ao carrinho`);
                                }
                              }}
                              disabled={sugestao.estoque === 0}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {sugestao.estoque} unidades disponíveis
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-muted-foreground"
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
