import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  type: "credit" | "debit" | "pix";
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  brand: string;
  isDefault: boolean;
}

export default function UserPaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      // TODO: Implementar chamada à API
      setPaymentMethods([]);
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implementar chamada à API
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      toast({
        title: "Cartão removido",
        description: "A forma de pagamento foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a forma de pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // TODO: Implementar chamada à API
      setPaymentMethods(prev =>
        prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
      );
      toast({
        title: "Cartão padrão definido",
        description: "Este cartão será usado por padrão nas suas compras.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir o cartão padrão.",
        variant: "destructive",
      });
    }
  };

  const maskCardNumber = (number: string) => {
    return `•••• •••• •••• ${number.slice(-4)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Formas de Pagamento
              </h1>
              <p className="text-gray-600">Gerencie seus cartões e métodos de pagamento</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cartão
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando formas de pagamento...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma forma de pagamento cadastrada
                </h3>
                <p className="text-gray-500 mb-6">
                  Adicione um cartão para agilizar suas compras
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cartão
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <Card key={method.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {method.brand.toUpperCase()} {method.type === "credit" ? "Crédito" : "Débito"}
                            </h3>
                            {method.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Padrão
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg font-mono text-gray-600 mb-1">
                            {maskCardNumber(method.cardNumber)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.cardHolder}
                          </p>
                          <p className="text-sm text-gray-500">
                            Validade: {method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Definir Padrão
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(method.id)}
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
