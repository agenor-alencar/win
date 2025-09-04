import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Edit,
  Trash2,
  Plus,
  Package,
  Store,
  Calendar,
  ThumbsUp,
} from "lucide-react";
import Header from "../../components/Header";

interface Review {
  id: string;
  type: "product" | "store";
  itemId: string;
  itemName: string;
  itemImage?: string;
  storeName?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  canEdit: boolean;
}

const mockReviews: Review[] = [
  {
    id: "1",
    type: "product",
    itemId: "1",
    itemName: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    itemImage: "/placeholder.svg",
    storeName: "Ferragens Silva",
    rating: 5,
    title: "Excelente qualidade!",
    comment:
      "Produto de ótima qualidade, chegou rapidinho e bem embalado. Parafusos resistentes e perfeitos para o que eu precisava. Recomendo!",
    date: "2024-01-15",
    helpful: 3,
    canEdit: true,
  },
  {
    id: "2",
    type: "store",
    itemId: "ferragens-silva",
    itemName: "Ferragens Silva",
    storeName: "Ferragens Silva",
    rating: 4,
    title: "Ótimo atendimento",
    comment:
      "Loja com bom atendimento e produtos de qualidade. Entrega foi rápida. Só perdeu uma estrela porque alguns itens estavam em falta.",
    date: "2024-01-12",
    helpful: 1,
    canEdit: true,
  },
  {
    id: "3",
    type: "product",
    itemId: "2",
    itemName: "Furadeira de Impacto 650W",
    itemImage: "/placeholder.svg",
    storeName: "Ferramentas Pro",
    rating: 5,
    title: "Superou expectativas",
    comment:
      "Furadeira muito boa! Potente e com ótimo acabamento. Vale cada centavo. Já usei em vários projetos e funciona perfeitamente.",
    date: "2024-01-10",
    helpful: 5,
    canEdit: true,
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const handleOpenDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setNewReview({
        rating: review.rating,
        title: review.title,
        comment: review.comment,
      });
    } else {
      setEditingReview(null);
      setNewReview({
        rating: 5,
        title: "",
        comment: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveReview = () => {
    if (editingReview) {
      // Update existing review
      setReviews(
        reviews.map((review) =>
          review.id === editingReview.id
            ? {
                ...review,
                rating: newReview.rating,
                title: newReview.title,
                comment: newReview.comment,
              }
            : review,
        ),
      );
    }
    setIsDialogOpen(false);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter((review) => review.id !== reviewId));
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (rating: number) => void,
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const productReviews = reviews.filter((review) => review.type === "product");
  const storeReviews = reviews.filter((review) => review.type === "store");

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Star className="h-8 w-8 mr-3" />
              Minhas Avaliações
            </h1>
            <p className="text-muted-foreground">
              Suas avaliações de produtos e lojas
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{reviews.length}</div>
              <div className="text-sm text-muted-foreground">
                Total de Avaliações
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{productReviews.length}</div>
              <div className="text-sm text-muted-foreground">Produtos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Store className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{storeReviews.length}</div>
              <div className="text-sm text-muted-foreground">Lojas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">
                {reviews.reduce((acc, review) => acc + review.helpful, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Úteis</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas ({reviews.length})</TabsTrigger>
            <TabsTrigger value="products">
              Produtos ({productReviews.length})
            </TabsTrigger>
            <TabsTrigger value="stores">
              Lojas ({storeReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ReviewsList
              reviews={reviews}
              onEdit={handleOpenDialog}
              onDelete={handleDeleteReview}
            />
          </TabsContent>

          <TabsContent value="products">
            <ReviewsList
              reviews={productReviews}
              onEdit={handleOpenDialog}
              onDelete={handleDeleteReview}
            />
          </TabsContent>

          <TabsContent value="stores">
            <ReviewsList
              reviews={storeReviews}
              onEdit={handleOpenDialog}
              onDelete={handleDeleteReview}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Avaliação</DialogTitle>
              <DialogDescription>
                Atualize sua avaliação sobre{" "}
                {editingReview?.type === "product" ? "o produto" : "a loja"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Avaliação</label>
                {renderStars(newReview.rating, true, (rating) =>
                  setNewReview({ ...newReview, rating }),
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Título</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newReview.title}
                  onChange={(e) =>
                    setNewReview({ ...newReview, title: e.target.value })
                  }
                  placeholder="Título da sua avaliação"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Comentário</label>
                <Textarea
                  className="mt-1"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder="Conte sobre sua experiência..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveReview}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  function ReviewsList({
    reviews,
    onEdit,
    onDelete,
  }: {
    reviews: Review[];
    onEdit: (review: Review) => void;
    onDelete: (reviewId: string) => void;
  }) {
    if (reviews.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhuma avaliação ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Faça uma compra e avalie produtos e lojas
            </p>
            <Button asChild>
              <Link to="/">Começar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {review.itemImage && (
                    <img
                      src={review.itemImage}
                      alt={review.itemName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant={
                          review.type === "product" ? "default" : "secondary"
                        }
                      >
                        {review.type === "product" ? "Produto" : "Loja"}
                      </Badge>
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        • {formatDate(review.date)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">
                      {review.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-2">
                      {review.itemName}
                      {review.storeName && review.type === "product" && (
                        <span> • {review.storeName}</span>
                      )}
                    </p>

                    <p className="text-muted-foreground mb-3">
                      {review.comment}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{review.helpful} pessoas acharam útil</span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.canEdit && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(review)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => onDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
