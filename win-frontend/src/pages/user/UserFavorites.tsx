import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  lojistaName: string;
}

export default function UserFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // TODO: Implementar chamada à API
      setFavorites([]);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: string) => {
    try {
      // TODO: Implementar chamada à API
      setFavorites(prev => prev.filter(item => item.id !== productId));
      toast({
        title: "Removido dos favoritos",
        description: "O produto foi removido da sua lista de favoritos.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
            <p className="text-gray-600">
              {favorites.length} {favorites.length === 1 ? "produto" : "produtos"} salvos
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando favoritos...</p>
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sua lista de favoritos está vazia
                </h3>
                <p className="text-gray-500 mb-6">
                  Salve produtos que você gostou para encontrá-los facilmente depois
                </p>
                <Button asChild>
                  <Link to="/">Explorar Produtos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link to={`/product/${product.id}`}>
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                              Esgotado
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-3">{product.lojistaName}</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">
                        R$ {product.price.toFixed(2)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Comprar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFavorite(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
