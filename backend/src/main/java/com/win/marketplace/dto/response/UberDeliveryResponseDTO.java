package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para resposta de criação de entrega via Uber Direct
 * 
 * Resposta de: POST /v1/customers/{customer_id}/deliveries
 * 
 * Exemplo:
 * {
 *   "delivery_id": "d9072015-8d82-4d89-aada-17db99bea481",
 *   "status": "SEARCHING_FOR_COURIER",
 *   "tracking_url": "https://m.uber.com/tracking/...",
 *   "pickup_pin_code": "1234",
 *   "delivery_pin_code": "5678",
 *   "created_at": "2024-03-24T10:30:00Z"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UberDeliveryResponseDTO {
    
    /**
     * ID único da entrega
     * Usado para rastreamento e atualizações
     */
    @JsonProperty("delivery_id")
    private String deliveryId;
    
    /**
     * Status da entrega
     * Possibilidades:
     * - SEARCHING_FOR_COURIER: Procurando motorista
     * - ACCEPTED: Motorista aceitou
     * - ARRIVED_AT_PICKUP: Motorista chegou no ponto de coleta
     * - PICKED_UP: Pedido coletado
     * - ARRIVED_AT_DROPOFF: Motorista chegou no ponto de entrega
     * - DELIVERED: Entregue
     * - CANCELLED: Cancelada
     */
    @JsonProperty("status")
    private String status;
    
    /**
     * URL de rastreamento em tempo real
     * Link que cliente pode acompanhar a entrega
     * Salvar no banco de dados para exibir ao cliente
     */
    @JsonProperty("tracking_url")
    private String urlRastreamento;
    
    /**
     * PIN de coleta
     * Enviado ao lojista para confirmar coleta com motorista
     */
    @JsonProperty("pickup_pin_code")
    private String pinColeta;
    
    /**
     * PIN de entrega
     * Enviado ao cliente para confirmar entrega com motorista
     */
    @JsonProperty("delivery_pin_code")
    private String pinEntrega;
    
    /**
     * Data/hora de criação da entrega
     */
    @JsonProperty("created_at")
    private String criadoEm;
    
    /**
     * Quote ID associado
     */
    @JsonProperty("quote_id")
    private String quoteId;
}
