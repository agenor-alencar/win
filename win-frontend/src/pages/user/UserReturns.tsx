import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  productImage: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestDate: string;
  refundAmount: number;
}

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "Aprovada", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  rejected: { label: "Rejeitada", color: "bg-red-100 text-red-800", icon: XCircle },
  completed: { label: "Concluída", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

export default function UserReturns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      // TODO: Implementar chamada à API
      setReturns([]);
    } catch (error) {
      console.error("Erro ao buscar devoluções:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Devoluções</h1>
            <p className="text-gray-600">Gerencie suas solicitações de devolução</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando devoluções...</p>
            </div>
          ) : returns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <RotateCcw className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma devolução solicitada
                </h3>
                <p className="text-gray-500">
                  Você não tem solicitações de devolução em andamento
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {returns.map((returnItem) => {
                const statusInfo = statusConfig[returnItem.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={returnItem.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Devolução #{returnItem.id}
                          </CardTitle>
                          <CardDescription>
                            Pedido #{returnItem.orderNumber}
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-4">
                        <img
                          src={returnItem.productImage}
                          alt={returnItem.productName}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{returnItem.productName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Motivo: {returnItem.reason}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Solicitado em{" "}
                            {new Date(returnItem.requestDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Reembolso</p>
                          <p className="text-lg font-bold text-gray-900">
                            R$ {returnItem.refundAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
