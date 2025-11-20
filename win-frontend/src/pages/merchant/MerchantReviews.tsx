import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  StarHalf,
  Search,
  MessageSquare,
  User,
  Calendar,
  Package,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { MerchantLayout } from "@/components/MerchantLayout";
import { api } from "../../lib/Api";

export default function MerchantReviews() {
  const [selectedTab, setSelectedTab] = useState("TODAS");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lojistaId, setLojistaId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    media: 0,
    cinco: 0,
    quatro: 0,
    tres: 0,
    dois: 0,
    um: 0,
  });
  const { success, error: notifyError } = useNotification();

  // Buscar ID do lojista ao montar o componente
  useEffect(() => {
    const fetchLojistaId = async () => {
      try {
        const response = await api.get("/api/v1/lojistas/me");
        setLojistaId(response.data.id);
      } catch (error) {
        console.error("Erro ao buscar dados do lojista:", error);
        notifyError(
          "Erro ao carregar",
          "Não foi possível carregar os dados do lojista"
        );
      }
    };
    fetchLojistaId();
  }, []);

  // Buscar avaliações quando lojistaId estiver disponível
  useEffect(() => {
    if (lojistaId) {
      fetchReviews();
    }
  }, [lojistaId]);

  const fetchReviews = async () => {
    if (!lojistaId) return;

    try {
      setLoading(true);
      const response = await api.get(
        `/v1/avaliacoes-produtos/lojista/${lojistaId}`,
        {
          params: {
            page: 0,
            size: 100,
            sort: "criadoEm,desc",
          },
        }
      );
      
      const reviewsData = response.data.content || response.data;
      setReviews(reviewsData);

      // Calcular estatísticas
      const total = reviewsData.length;
      const soma = reviewsData.reduce((acc: number, r: any) => acc + r.nota, 0);
      const media = total > 0 ? soma / total : 0;

      const cinco = reviewsData.filter((r: any) => r.nota === 5).length;
      const quatro = reviewsData.filter((r: any) => r.nota === 4).length;
      const tres = reviewsData.filter((r: any) => r.nota === 3).length;
      const dois = reviewsData.filter((r: any) => r.nota === 2).length;
      const um = reviewsData.filter((r: any) => r.nota === 1).length;

      setStats({ total, media, cinco, quatro, tres, dois, um });
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      notifyError(
        "Erro ao carregar avaliações",
        "Não foi possível carregar as avaliações dos produtos"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4"
          fill="#F59E0B"
          color="#F59E0B"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="h-4 w-4" fill="#F59E0B" color="#F59E0B" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4" color="#D1D5DB" />
      );
    }

    return stars;
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesTab =
      selectedTab === "TODAS" ||
      (selectedTab === "5" && review.nota === 5) ||
      (selectedTab === "4" && review.nota === 4) ||
      (selectedTab === "3" && review.nota === 3) ||
      (selectedTab === "1-2" && (review.nota === 1 || review.nota === 2));

    const matchesSearch =
      review.produto?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.usuario?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comentario?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getTabCounts = () => {
    return {
      TODAS: reviews.length,
      "5": stats.cinco,
      "4": stats.quatro,
      "3": stats.tres,
      "1-2": stats.dois + stats.um,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-[#3DBEAB]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Avaliações dos Produtos
              </h1>
              <p className="text-sm text-gray-600">
                Veja o que os clientes estão dizendo sobre seus produtos
              </p>
            </div>
          </div>

          <Link to="/merchant/dashboard">
            <Button variant="outline" className="rounded-xl">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Total de Avaliações
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#3DBEAB",
                    }}
                  >
                    {stats.total}
                  </p>
                </div>
                <MessageSquare
                  className="h-8 w-8"
                  style={{ color: "#3DBEAB" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Avaliação Média
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#F59E0B",
                      }}
                    >
                      {stats.media.toFixed(1)}
                    </p>
                    <div className="flex">{renderStars(stats.media)}</div>
                  </div>
                </div>
                <Star className="h-8 w-8" style={{ color: "#F59E0B" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    5 Estrelas
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    {stats.cinco}
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8" style={{ color: "#10B981" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Produtos Avaliados
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#2D9CDB",
                    }}
                  >
                    {new Set(reviews.map((r) => r.produto?.id)).size}
                  </p>
                </div>
                <Package className="h-8 w-8" style={{ color: "#2D9CDB" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por produto, cliente ou comentário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              style={{ borderRadius: "12px", fontSize: "16px" }}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-6"
        >
          <TabsList
            className="grid w-full grid-cols-5"
            style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
          >
            <TabsTrigger
              value="TODAS"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              Todas ({tabCounts.TODAS})
            </TabsTrigger>
            <TabsTrigger
              value="5"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              5 ⭐ ({tabCounts["5"]})
            </TabsTrigger>
            <TabsTrigger
              value="4"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              4 ⭐ ({tabCounts["4"]})
            </TabsTrigger>
            <TabsTrigger
              value="3"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              3 ⭐ ({tabCounts["3"]})
            </TabsTrigger>
            <TabsTrigger
              value="1-2"
              style={{ borderRadius: "12px" }}
              className="data-[state=active]:bg-white"
            >
              1-2 ⭐ ({tabCounts["1-2"]})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DBEAB] mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando avaliações...</p>
          </div>
        )}

        {/* Reviews List */}
        {!loading && (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card
                key={review.id}
                style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#333333",
                              }}
                            >
                              {review.usuario?.nome || "Cliente"}
                            </h3>
                            <p style={{ fontSize: "12px", color: "#666666" }}>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(review.criadoEm).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.nota)}
                          </div>
                        </div>

                        <div
                          className="p-3 rounded-lg mb-3"
                          style={{ backgroundColor: "#F8F9FA" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-gray-600" />
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333333",
                              }}
                            >
                              {review.produto?.nome || "Produto"}
                            </p>
                          </div>
                        </div>

                        {review.comentario && (
                          <div
                            className="p-4 rounded-lg"
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            <p style={{ fontSize: "14px", color: "#666666" }}>
                              "{review.comentario}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <Star
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: "#E5E7EB" }}
            />
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#333333",
                marginBottom: "8px",
              }}
            >
              Nenhuma avaliação encontrada
            </h3>
            <p style={{ fontSize: "16px", color: "#666666" }}>
              {searchQuery
                ? "Tente ajustar os filtros de busca"
                : "Seus produtos ainda não receberam avaliações"}
            </p>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
}
