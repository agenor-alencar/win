/**
 * Componente para confirmar entrega (botão "Pronto para Retirada")
 * Integrado no painel do lojista
 * 
 * Responsibilities:
 * - Exibir botão "Pronto para Retirada"
 * - Coletar PIN codes (não opcional!)
 * - Chamar API de Create Delivery
 * - Exibir tracking URL para cliente
 * - Gerenciar PIN codes (mostrar/copiar)
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Truck,
} from "lucide-react";
import { useUberDelivery } from "@/hooks/useUberDelivery";

interface ConfirmarEntregaProps {
  pedidoId: string;
  quoteId: string;
  nomeCliente: string;
  telefoneCliente: string;
  enderecoEntrega: string;
  latEntrega: number;
  lonEntrega: number;
  cepLojista: string;
  enderecoLojista: string;
  latLojista: number;
  lonLojista: number;
  notasEntrega?: string;
  onEntregaConfirmada?: (delivery: any) => void;
  onErro?: (erro: string) => void;
}

export const ConfirmarEntrega: React.FC<ConfirmarEntregaProps> = ({
  pedidoId,
  quoteId,
  nomeCliente,
  telefoneCliente,
  enderecoEntrega,
  latEntrega,
  lonEntrega,
  cepLojista,
  enderecoLojista,
  latLojista,
  lonLojista,
  notasEntrega,
  onEntregaConfirmada,
  onErro,
}) => {
  const { loading, criarEntrega, gerarPinCode } = useUberDelivery();
  const [aberto, setAberto] = useState(false);
  const [pinColeta, setPinColeta] = useState("");
  const [pinEntrega, setPinEntrega] = useState("");
  const [mostrarPins, setMostrarPins] = useState(false);
  const [delivery, setDelivery] = useState<any>(null);
  const [copiado, setCopiado] = useState<"coleta" | "entrega" | null>(null);

  const handleGerarPins = async () => {
    try {
      const pin1 = await gerarPinCode();
      const pin2 = await gerarPinCode();
      setPinColeta(pin1);
      setPinEntrega(pin2);
    } catch (err: any) {
      onErro?.(err.message);
    }
  };

  const handleConfirmar = async () => {
    if (!pinColeta || !pinEntrega) {
      onErro?.("PIN codes obrigatórios");
      return;
    }

    try {
      const resultado = await criarEntrega(
        quoteId,
        pedidoId,
        nomeCliente,
        telefoneCliente,
        enderecoLojista,
        latLojista,
        lonLojista,
        enderecoEntrega,
        latEntrega,
        lonEntrega,
        pinColeta,
        pinEntrega,
        notasEntrega
      );

      setDelivery(resultado);
      onEntregaConfirmada?.(resultado);
    } catch (err: any) {
      onErro?.(err.message);
    }
  };

  const copiarParaAreaTransferencia = (texto: string, tipo: "coleta" | "entrega") => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={() => setAberto(true)}
      >
        <Truck className="h-4 w-4 mr-2" />
        Pronto para Retirada
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
            <DialogDescription>
              Prepare o pedido para o motorista da Uber
            </DialogDescription>
          </DialogHeader>

          {!delivery ? (
            <div className="space-y-6">
              {/* Informações do Pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações da Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Cliente:</Label>
                      <p className="font-medium">{nomeCliente}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Telefone:</Label>
                      <p className="font-medium">{telefoneCliente}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Endereço de Entrega:</Label>
                      <p className="font-medium">{enderecoEntrega}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PIN Codes (OBRIGATÓRIO) */}
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">PIN Codes Obrigatórios</AlertTitle>
                <AlertDescription className="text-red-700 text-sm">
                  ⚠️ Os PIN codes são obrigatórios para validar coleta e entrega. Configure-os
                  abaixo.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* PIN de Coleta */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-semibold">PIN de Coleta</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMostrarPins(!mostrarPins)}
                    >
                      {mostrarPins ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    O motorista fornecerá este código para você confirmar a coleta
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type={mostrarPins ? "text" : "password"}
                      value={pinColeta}
                      onChange={(e) => setPinColeta(e.target.value.replace(/\D/g, ""))}
                      placeholder="1234"
                      maxLength={6}
                      className="flex-1 font-mono text-lg tracking-widest"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copiarParaAreaTransferencia(pinColeta, "coleta")
                      }
                      disabled={!pinColeta}
                    >
                      {copiado === "coleta" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* PIN de Entrega */}
                <div>
                  <Label className="font-semibold">PIN de Entrega</Label>
                  <p className="text-xs text-gray-600 mb-2">
                    O cliente fornecerá este código ao motorista para confirmar entrega
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type={mostrarPins ? "text" : "password"}
                      value={pinEntrega}
                      onChange={(e) => setPinEntrega(e.target.value.replace(/\D/g, ""))}
                      placeholder="5678"
                      maxLength={6}
                      className="flex-1 font-mono text-lg tracking-widest"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copiarParaAreaTransferencia(pinEntrega, "entrega")
                      }
                      disabled={!pinEntrega}
                    >
                      {copiado === "entrega" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Botão Gerar PINs */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGerarPins}
                  disabled={loading}
                >
                  Gerar PIN Codes Aleatoriamente
                </Button>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setAberto(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmar}
                  disabled={loading || !pinColeta || !pinEntrega}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar Entrega
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Sucesso - Mostrar URL de Rastreamento */
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Entrega Confirmada!</AlertTitle>
                <AlertDescription className="text-green-700">
                  O motorista foi atribuído e está a caminho para coletar o pedido.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações da Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-600">Delivery ID:</Label>
                    <p className="font-mono break-all">{delivery.id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Status:</Label>
                    <p>
                      <Badge>{delivery.status}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 block mb-2">
                      URL de Rastreamento:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={delivery.tracking_url}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(delivery.tracking_url);
                          setCopiado("coleta");
                          setTimeout(() => setCopiado(null), 2000);
                        }}
                      >
                        {copiado === "coleta" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">PIN de Coleta (para você):</Label>
                    <p className="font-mono text-lg font-bold text-blue-600">
                      {delivery.pin_coleta}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">PIN de Entrega (para cliente):</Label>
                    <p className="font-mono text-lg font-bold text-green-600">
                      {delivery.pin_entrega}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                onClick={() => setAberto(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
