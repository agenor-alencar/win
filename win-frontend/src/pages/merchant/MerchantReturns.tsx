import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PackageCheck, Search } from "lucide-react";
import { MerchantLayout } from "@/components/MerchantLayout";
import { merchantApi } from "@/lib/merchant/MerchantApi";
import { returnsApi, DevolucaoResponse } from "@/lib/api/returnsApi";
import { useToast } from "@/hooks/use-toast";

export default function MerchantReturns() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<DevolucaoResponse[]>([]);
  const [confirmingReturn, setConfirmingReturn] = useState<DevolucaoResponse | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchPendingReturns = async () => {
      try {
        setLoading(true);
        const lojista = await merchantApi.getMerchantProfile();
        const pendingReturns = await returnsApi.getPendingReturnsForMerchant(lojista.id);
        setReturns(pendingReturns);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar devolucoes",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Nao foi possivel carregar as devolucoes pendentes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReturns();
  }, [toast]);

  const filteredReturns = useMemo(() => {
    if (!searchQuery.trim()) {
      return returns;
    }

    const query = searchQuery.toLowerCase();
    return returns.filter((item) => {
      const customer = item.usuarioNome || item.usuarioEmail || item.usuarioId;
      const product = item.produtoNome || "";
      return (
        customer.toLowerCase().includes(query) ||
        product.toLowerCase().includes(query) ||
        item.numeroDevolucao?.toLowerCase().includes(query)
      );
    });
  }, [returns, searchQuery]);

  const handleConfirmReceipt = async () => {
    if (!confirmingReturn) return;

    try {
      setIsConfirming(true);
      await returnsApi.confirmReceipt(confirmingReturn.id);

      setReturns((prev) => prev.filter((item) => item.id !== confirmingReturn.id));
      toast({
        title: "Rececao confirmada",
        description: "Estorno liberado com sucesso.",
      });
      setConfirmingReturn(null);
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Nao foi possivel confirmar a devolucao.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Devolucoes pendentes</h1>
          <p className="text-sm text-gray-600">
            Confirme o recebimento fisico para liberar o estorno automatico.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por cliente ou item"
            className="pl-9"
          />
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-500">
              Carregando devolucoes pendentes...
            </CardContent>
          </Card>
        ) : filteredReturns.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-500">
              Nenhuma devolucao pendente encontrada.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((item) => (
              <Card key={item.id} className="border-muted">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.usuarioNome || item.usuarioEmail || "Cliente"}
                      </span>
                      <Badge variant="outline">AGUARDANDO_ENTREGA_BALCAO</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Item: {item.produtoNome || "Produto"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valor: R$ {item.valorDevolucao.toFixed(2)}
                    </p>
                  </div>

                  <Button
                    className="w-full md:w-auto"
                    onClick={() => setConfirmingReturn(item)}
                  >
                    Confirmar Rececao no Balcao
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!confirmingReturn} onOpenChange={(open) => !open && setConfirmingReturn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar recebimento</DialogTitle>
            <DialogDescription>
              Confirma que recebeu o item fisico em perfeitas condicoes? O estorno sera liberado.
            </DialogDescription>
          </DialogHeader>

          {confirmingReturn && (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-gray-700">
              <p className="font-medium">{confirmingReturn.usuarioNome || "Cliente"}</p>
              <p>Item: {confirmingReturn.produtoNome || "Produto"}</p>
              <p>Valor: R$ {confirmingReturn.valorDevolucao.toFixed(2)}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmingReturn(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmReceipt} disabled={isConfirming}>
              {isConfirming ? "Confirmando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
