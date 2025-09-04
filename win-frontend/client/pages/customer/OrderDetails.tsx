import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotification } from "../../contexts/NotificationContext";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  Copy,
  Star,
  Download,
  MessageSquare,
  Navigation,
  User,
  Home,
  Grid3X3,
  ShoppingCart,
} from "lucide-react";
import { orderData } from "./orderData";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedItemForRating, setSelectedItemForRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { success, error } = useNotification();

  const copyDeliveryCode = () => {
    navigator.clipboard.writeText(orderData.delivery.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const callDriver = () => {
    window.location.href = `tel:${orderData.delivery.driverPhone}`;
  };

  const handleReportProblem = () => {
    if (!reportReason || !reportDescription.trim()) {
      error(
        "Campos obrigatórios",
        "Por favor, selecione um motivo e descreva o problema.",
      );
      return;
    }

    // Simulate API call
    setTimeout(() => {
      success(
        "Problema reportado!",
        "Sua solicitação foi enviada. Entraremos em contato em breve.",
      );
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
    }, 1000);
  };

  const handleCancelOrder = () => {
    if (!cancelReason) {
      error(
        "Motivo obrigatório",
        "Por favor, selecione um motivo para o cancelamento.",
      );
      return;
    }

    // Simulate API call
    setTimeout(() => {
      success(
        "Pedido cancelado!",
        "Seu pedido foi cancelado. O reembolso será processado em até 5 dias úteis.",
      );
      setCancelDialogOpen(false);
      setCancelReason("");
      // In a real app, you might redirect to orders page or update order status
    }, 1000);
  };

  const handleRateItem = (item: any) => {
    setSelectedItemForRating(item);
    setRatingDialogOpen(true);
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      error(
        "Avaliação obrigatória",
        "Por favor, selecione uma nota de 1 a 5 estrelas.",
      );
      return;
    }

    // Simulate API call
    setTimeout(() => {
      success(
        "Avaliação enviada!",
        `Obrigado por avaliar ${selectedItemForRating?.name}`,
      );
      setRatingDialogOpen(false);
      setSelectedItemForRating(null);
      setRating(0);
      setReviewText("");
    }, 1000);
  };

  const renderStars = (
    currentRating: number,
    onStarClick?: (rating: number) => void,
  ) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starRating = index + 1;
      return (
        <button
          key={index}
          type="button"
          onClick={() => onStarClick && onStarClick(starRating)}
          className={`text-2xl ${
            starRating <= currentRating ? "text-yellow-400" : "text-gray-300"
          } ${onStarClick ? "hover:text-yellow-400 cursor-pointer" : ""}`}
          disabled={!onStarClick}
        >
          ★
        </button>
      );
    });
  };

  const getCurrentStatusText = () => {
    switch (orderData.status) {
      case "confirmed":
        return "Pedido confirmado e enviado para as lojas";
      case "preparing":
        return "Os itens estão sendo preparados";
      case "ready":
        return "Pedido pronto, aguardando entregador";
      case "in_transit":
        return `${orderData.delivery.driverName} está a caminho`;
      case "delivered":
        return "Pedido entregue com sucesso";
      default:
        return "Processando pedido...";
    }
  };

  const getEstimatedDelivery = () => {
    if (orderData.status === "delivered") return "Entregue";
    if (orderData.status === "in_transit")
      return `Chega em ${orderData.delivery.estimatedTime}`;
    return "Aguardando";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/orders" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:block">Voltar aos Pedidos</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold">#{orderData.id}</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date(orderData.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Comprovante
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Banner */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {getCurrentStatusText()}
                </h2>
                <p className="text-muted-foreground">
                  {getEstimatedDelivery()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  R$ {orderData.total.toFixed(2).replace(".", ",")}
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {orderData.status === "in_transit"
                    ? "Em Trânsito"
                    : "Preparando"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Rastreamento do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orderData.tracking.map((step, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        {index < orderData.tracking.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              step.completed ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Driver Info - Only show when in transit */}
            {orderData.status === "in_transit" && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          {orderData.delivery.driverName}
                        </h3>
                        <p className="text-blue-700">Entregador WIN</p>
                        <p className="text-sm text-blue-600">
                          {orderData.delivery.currentLocation}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={callDriver}>
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        {showMap ? "Ocultar" : "Ver"} Mapa
                      </Button>
                    </div>
                  </div>

                  {showMap && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">
                          🗺️ Mapa de rastreamento em tempo real
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.store} • Qtd: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          R${" "}
                          {(item.price * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                        {orderData.status === "delivered" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRateItem(item)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Avaliar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      R$ {orderData.subtotal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>
                      -R$ {orderData.discount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Frete</span>
                    <span>GRÁTIS</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {orderData.total.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Code */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-lg mb-2">
                  Código de Recebimento
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Informe este código ao entregador
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="text-3xl font-mono font-bold text-primary">
                    {orderData.delivery.code}
                  </div>
                </div>
                <Button
                  onClick={copyDeliveryCode}
                  variant={copiedCode ? "secondary" : "default"}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedCode ? "Código Copiado!" : "Copiar Código"}
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Endereço de Entrega
                </h3>
                <div className="space-y-2">
                  <p className="font-medium">{orderData.customer.name}</p>
                  <p className="text-muted-foreground">
                    {orderData.customer.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {orderData.customer.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Pagamento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Método</span>
                    <span className="font-medium">
                      {orderData.payment.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      Aprovado
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ID Transação</span>
                    <span className="font-mono text-xs">
                      {orderData.payment.transactionId}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Dialog
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Reportar Problema
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reportar Problema</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="report-reason">Qual é o problema?</Label>
                      <Select
                        value={reportReason}
                        onValueChange={setReportReason}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione um motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="produto-defeituoso">
                            Produto defeituoso
                          </SelectItem>
                          <SelectItem value="produto-errado">
                            Produto errado
                          </SelectItem>
                          <SelectItem value="nao-entregue">
                            Não foi entregue
                          </SelectItem>
                          <SelectItem value="entrega-atrasada">
                            Entrega atrasada
                          </SelectItem>
                          <SelectItem value="embalagem-danificada">
                            Embalagem danificada
                          </SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="report-description">
                        Descreva o problema
                      </Label>
                      <Textarea
                        id="report-description"
                        placeholder="Conte-nos mais detalhes sobre o que aconteceu..."
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        className="mt-2"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setReportDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleReportProblem} className="flex-1">
                        Enviar Relatório
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Cancelar Pedido
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cancelar Pedido</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Tem certeza que deseja cancelar este pedido?</p>
                      <p className="mt-2 font-medium">Pedido: {orderData.id}</p>
                      <p>Total: R$ {orderData.total.toFixed(2)}</p>
                    </div>

                    <div>
                      <Label htmlFor="cancel-reason">
                        Por que está cancelando?
                      </Label>
                      <Select
                        value={cancelReason}
                        onValueChange={setCancelReason}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione um motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao-preciso-mais">
                            Não preciso mais
                          </SelectItem>
                          <SelectItem value="encontrei-mais-barato">
                            Encontrei mais barato
                          </SelectItem>
                          <SelectItem value="demora-entrega">
                            Demora na entrega
                          </SelectItem>
                          <SelectItem value="mudei-de-ideia">
                            Mudei de ideia
                          </SelectItem>
                          <SelectItem value="problemas-pagamento">
                            Problemas com pagamento
                          </SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Atenção:</strong> O reembolso será processado em
                        até 5 dias úteis após o cancelamento.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setCancelDialogOpen(false)}
                        className="flex-1"
                      >
                        Manter Pedido
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelOrder}
                        className="flex-1"
                      >
                        Confirmar Cancelamento
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Rating Modal */}
        <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Avaliar Produto</DialogTitle>
            </DialogHeader>
            {selectedItemForRating && (
              <div className="space-y-4">
                {/* Product Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={selectedItemForRating.image}
                    alt={selectedItemForRating.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {selectedItemForRating.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {selectedItemForRating.store}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="text-center">
                  <Label className="text-sm font-medium">
                    Qual sua nota para este produto?
                  </Label>
                  <div className="flex justify-center space-x-1 mt-2">
                    {renderStars(rating, setRating)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {rating === 0 && "Clique nas estrelas para avaliar"}
                    {rating === 1 && "Péssimo"}
                    {rating === 2 && "Ruim"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bom"}
                    {rating === 5 && "Excelente"}
                  </p>
                </div>

                {/* Review Text */}
                <div>
                  <Label htmlFor="review-text">
                    Conte sua experiência (opcional)
                  </Label>
                  <Textarea
                    id="review-text"
                    placeholder="O que você achou do produto? Suas observações ajudam outros compradores..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Review Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Dicas para uma boa avaliação:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-1">
                    <li>• Comente sobre a qualidade do produto</li>
                    <li>• Mencione se atendeu suas expectativas</li>
                    <li>• Avalie o atendimento da loja</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRatingDialogOpen(false);
                      setSelectedItemForRating(null);
                      setRating(0);
                      setReviewText("");
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitRating} className="flex-1">
                    Enviar Avaliação
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
          </Link>
          <Link
            to="/orders"
            className="flex flex-col items-center justify-center text-primary"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs mt-1">Pedidos</span>
          </Link>
          <Link
            to="/profile"
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
