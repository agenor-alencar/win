import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
  orderId: string;
}

export default function UserReviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // TODO: Implementar chamada à API
      setReviews([]);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Avaliações</h1>
            <p className="text-gray-600">Avalie produtos que você comprou</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando avaliações...</p>
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma avaliação ainda
                </h3>
                <p className="text-gray-500 mb-6">
                  Após receber seus pedidos, você poderá avaliar os produtos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {review.productName}
                        </h3>
                        {renderStars(review.rating)}
                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Avaliado em {new Date(review.date).toLocaleDateString("pt-BR")}
                        </p>
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
