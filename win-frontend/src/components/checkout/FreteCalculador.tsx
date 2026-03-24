/**
 * Componente para calcular e exibir cotação de frete no checkout
 * 
 * Responsabilidades:
 * - Geocodificar endereços (lojista + cliente)
 * - Chamar API de cotação
 * - Exibir valor do frete com taxa Win
 * - Mostrar tempo estimado
 * - Salvar quote_id para usar na confirmação de entrega
 */

import React, { useEffect, useState } from "react";
import { useUberDelivery } from "@/hooks/useUberDelivery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FreteCalculadorProps {
  cepLojista: string;
  enderecoLojista: string;
  cidadeLojista: string;
  estadoLojista: string;
  
  cepCliente: string;
  enderecoCliente: string;
  cidadeCliente: string;
  estadoCliente: string;
  nomeCliente: string;
  
  pedidoId: string;
  
  onCotacaoObtida?: (cotacao: any) => void;
  onErro?: (erro: string) => void;
}

export const FreteCalculador: React.FC<FreteCalculadorProps> = ({
  cepLojista,
  enderecoLojista,
  cidadeLojista,
  estadoLojista,
  cepCliente,
  enderecoCliente,
  cidadeCliente,
  estadoCliente,
  nomeCliente,
  pedidoId,
  onCotacaoObtida,
  onErro,
}) => {
  const { loading, error, geocodificarEndereco, solicitarCotacao } = useUberDelivery();
  const [cotacao, setCotacao] = useState<any>(null);
  const [etapa, setEtapa] = useState<"carregando" | "sucesso" | "erro">("carregando");

  useEffect(() => {
    const calcularFrete = async () => {
      try {
        setEtapa("carregando");

        // 1. Geocodificar lojista
        const coordsLojista = await geocodificarEndereco(
          cepLojista,
          enderecoLojista,
          cidadeLojista,
          estadoLojista
        );

        // 2. Geocodificar cliente
        const coordsCliente = await geocodificarEndereco(
          cepCliente,
          enderecoCliente,
          cidadeCliente,
          estadoCliente
        );

        // 3. Solicitar cotação
        const resultado = await solicitarCotacao(
          coordsLojista.latitude,
          coordsLojista.longitude,
          coordsCliente.latitude,
          coordsCliente.longitude,
          pedidoId
        );

        setCotacao(resultado);
        setEtapa("sucesso");
        onCotacaoObtida?.(resultado);
      } catch (err: any) {
        console.error("Erro ao calcular frete:", err);
        setEtapa("erro");
        onErro?.(err.message);
      }
    };

    if (
      cepLojista &&
      enderecoLojista &&
      cepCliente &&
      enderecoCliente &&
      pedidoId
    ) {
      calcularFrete();
    }
  }, [
    cepLojista,
    enderecoLojista,
    cidadeLojista,
    estadoLojista,
    cepCliente,
    enderecoCliente,
    cidadeCliente,
    estadoCliente,
    pedidoId,
  ]);

  if (etapa === "carregando") {
    return (
      <Card className="w-full border-b-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Calculando Frete
          </CardTitle>
          <CardDescription>Aguarde um momento...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (etapa === "erro" || error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "Erro ao calcular frete. Tente novamente."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!cotacao) {
    return null;
  }

  return (
    <Card className="w-full border-l-4 border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            Opção de Entrega
          </div>
          <Badge variant="outline" className="text-green-600">
            Uber Direct
          </Badge>
        </CardTitle>
        <CardDescription>
          Entrega rápida com rastreamento em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tempo Estimado */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Tempo estimado:</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-gray-600">Coleta:</p>
                <p className="text-lg font-bold text-blue-600">
                  {cotacao.tempo_coleta_min}
                  <span className="text-xs ml-1">min</span>
                </p>
              </div>
              <div className="mx-4 border-l-2 border-blue-300"></div>
              <div>
                <p className="text-xs text-gray-600">Entrega:</p>
                <p className="text-lg font-bold text-blue-600">
                  {cotacao.tempo_entrega_min}
                  <span className="text-xs ml-1">min</span>
                </p>
              </div>
            </div>
          </div>

          {/* Preço */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Valor da entrega (Uber):</span>
              <span className="font-medium">
                R$ {(cotacao.frete_uber).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Taxa de processamento (10%):</span>
              <span>R$ {(cotacao.taxa_win).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total do frete:</span>
              <span className="text-green-600">
                R$ {(cotacao.frete_cliente).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            ℹ️ Este valor será adicionado ao total do seu pedido. O motorista será
            atribuído assim que você confirmar a compra.
          </div>

          {/* Quote ID (hidden) */}
          <input
            type="hidden"
            id="quote_id"
            value={cotacao.quote_id}
          />
        </div>
      </CardContent>
    </Card>
  );
};
