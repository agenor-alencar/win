/**
 * Hook para integração com APIs de frete e geocoding
 * 
 * Funções:
 * - Geocodificar endereços (CEP + logradouro)
 * - Solicitar cotação de frete
 * - Criar entrega (confirmar "Pronto para Retirada")
 * - Consultar status de entrega em tempo real
 */

import { api } from "@/lib/Api";
import { useState, useCallback } from "react";

interface Coordenadas {
  latitude: number;
  longitude: number;
}

interface Rota {
  origem: Coordenadas & { cep: string; endereco: string };
  destino: Coordenadas & { cep: string; endereco: string };
}

interface Cotacao {
  quote_id: string;
  frete_cliente: number;
  frete_uber: number;
  taxa_win: number;
  moeda: string;
  tempo_coleta_min: number;
  tempo_entrega_min: number;
}

interface Entrega {
  id: string;
  status: string;
  tracking_url: string;
  pin_coleta: string;
  pin_entrega: string;
}

interface StatusEntrega {
  status: string;
  tracking_url: string;
  courier_name?: string;
  courier_latitude?: number;
  courier_longitude?: number;
  estimated_arrival?: number;
}

export const useUberDelivery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Geocodifica um endereço (CEP + rua/número)
   */
  const geocodificarEndereco = useCallback(
    async (cep: string, endereco: string, cidade: string, estado: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/v1/geocoding/endereco", {
          params: {
            cep,
            endereco: `${endereco}, ${cidade}, ${estado}`,
          },
        });

        if (response.data.sucesso === false) {
          throw new Error(response.data.erro || "Erro ao geocodificar");
        }

        return {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        } as Coordenadas;
      } catch (err: any) {
        const mensagem = err.response?.data?.erro || err.message;
        setError(mensagem);
        throw new Error(mensagem);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Solicita cotação de frete via Uber Direct
   */
  const solicitarCotacao = useCallback(
    async (
      origemLat: number,
      origemLon: number,
      destinoLat: number,
      destinoLon: number,
      pedidoId: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post("/v1/uber/quotes/simples", null, {
          params: {
            origem_lat: origemLat,
            origem_lon: origemLon,
            destino_lat: destinoLat,
            destino_lon: destinoLon,
            pedido_id: pedidoId,
          },
        });

        if (!response.data.sucesso) {
          throw new Error(response.data.erro || "Erro ao cotizar frete");
        }

        return {
          quote_id: response.data.quote_id,
          frete_cliente: response.data.frete_cliente,
          frete_uber: response.data.frete_uber,
          taxa_win: response.data.taxa_win,
          moeda: response.data.moeda,
          tempo_coleta_min: response.data.tempo_coleta_min,
          tempo_entrega_min: response.data.tempo_entrega_min,
        } as Cotacao;
      } catch (err: any) {
        const mensagem = err.response?.data?.erro || err.message;
        setError(mensagem);
        throw new Error(mensagem);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cria entrega na Uber Direct (confirma "Pronto para Retirada")
   */
  const criarEntrega = useCallback(
    async (
      quoteId: string,
      pedidoId: string,
      nomeCliente: string,
      telefoneCliente: string,
      enderecoColeta: string,
      latColeta: number,
      lonColeta: number,
      enderecoEntrega: string,
      latEntrega: number,
      lonEntrega: number,
      pinColeta: string,
      pinEntrega: string,
      notasEntrega?: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          quote_id: quoteId,
          order_reference_id: pedidoId,
          pickup_address: {
            address: enderecoColeta,
            latitude: latColeta,
            longitude: lonColeta,
          },
          dropoff_address: {
            address: enderecoEntrega,
            latitude: latEntrega,
            longitude: lonEntrega,
          },
          pickup_phone_number: "+55 11 98765-4321", // TODO: from merchant config
          dropoff_phone_number: telefoneCliente,
          dropoff_name: nomeCliente,
          dropoff_notes: notasEntrega || "",
          pickup_instructions: "Chamar quando chegar",
          dropoff_instructions: "Deixar no portão",
          pickup_pin_code: pinColeta,
          delivery_pin_code: pinEntrega,
        };

        const response = await api.post(
          `/v1/uber/deliveries?pedido_id=${pedidoId}`,
          payload
        );

        if (!response.data.sucesso) {
          throw new Error(response.data.erro || "Erro ao criar entrega");
        }

        return {
          id: response.data.delivery.id,
          status: response.data.delivery.status,
          tracking_url: response.data.delivery.tracking_url,
          pin_coleta: response.data.delivery.pin_coleta,
          pin_entrega: response.data.delivery.pin_entrega,
        } as Entrega;
      } catch (err: any) {
        const mensagem = err.response?.data?.erro || err.message;
        setError(mensagem);
        throw new Error(mensagem);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Consulta status em tempo real de uma entrega
   */
  const consultarStatusEntrega = useCallback(async (deliveryId: string) => {
    try {
      const response = await api.get(`/v1/uber/deliveries/${deliveryId}/status`);

      if (!response.data.sucesso) {
        throw new Error("Erro ao consultar status");
      }

      const delivery = response.data.delivery;

      return {
        status: delivery.status,
        tracking_url: delivery.tracking_url,
        courier_name: delivery.courier_name,
        courier_latitude: delivery.courier_latitude,
        courier_longitude: delivery.courier_longitude,
        estimated_arrival: delivery.estimated_arrival,
      } as StatusEntrega;
    } catch (err: any) {
      throw err;
    }
  }, []);

  /**
   * Gera PIN code aleatório
   */
  const gerarPinCode = useCallback(async () => {
    try {
      const response = await api.post("/v1/uber/deliveries/generate-pin");

      if (!response.data.sucesso) {
        throw new Error("Erro ao gerar PIN");
      }

      return response.data.pin;
    } catch (err: any) {
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    geocodificarEndereco,
    solicitarCotacao,
    criarEntrega,
    consultarStatusEntrega,
    gerarPinCode,
  };
};
