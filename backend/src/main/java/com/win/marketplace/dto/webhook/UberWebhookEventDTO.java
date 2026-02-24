package com.win.marketplace.dto.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO otimizado para receber eventos de webhook da Uber Direct API.
 * 
 * <p>Estrutura baseada na documentação oficial:
 * https://developer.uber.com/docs/direct/guides/webhooks</p>
 * 
 * <p>Eventos possíveis:
 * <ul>
 *   <li>deliveries.courier_assigned - Motorista atribuído</li>
 *   <li>deliveries.courier_approaching_pickup - A caminho da coleta</li>
 *   <li>deliveries.courier_at_pickup - Chegou no local de coleta</li>
 *   <li>deliveries.courier_approaching_dropoff - A caminho da entrega</li>
 *   <li>deliveries.courier_at_dropoff - Chegou no local de entrega</li>
 *   <li>deliveries.delivered - Entrega concluída</li>
 *   <li>deliveries.canceled - Entrega cancelada</li>
 *   <li>deliveries.delivery_status_updated - Status atualizado</li>
 * </ul></p>
 * 
 * @since 2026-02-24
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UberWebhookEventDTO {
    
    /**
     * Tipo de evento
     */
    @JsonProperty("event_type")
    private String eventType;
    
    /**
     * ID da entrega na Uber
     */
    @JsonProperty("delivery_id")
    private String deliveryId;
    
    /**
     * Status atual da entrega
     */
    private String status;
    
    /**
     * Timestamp do evento
     */
    private Instant timestamp;
    
    /**
     * Informações do motorista (disponível após courier_assigned)
     */
    private CourierData courier;
    
    /**
     * Informações de pickup/coleta (ETA e verificação)
     */
    private LocationData pickup;
    
    /**
     * Informações de dropoff/entrega (ETA e verificação)
     */
    private LocationData dropoff;
    
    /**
     * Motivo do cancelamento (presente apenas se status = cancelled)
     * Valores possíveis: CUSTOMER_CANCELED, DRIVER_CANCELED, etc.
     */
    @JsonProperty("cancellation_reason")
    private String cancellationReason;
    
    /**
     * ID externo do pedido (external_store_id configurado na criação)
     */
    @JsonProperty("external_id")
    private String externalId;
    
    /**
     * Metadados adicionais (resource_id = delivery_id)
     */
    private MetaData meta;
    
    /**
     * Dados completos da entrega (presente em alguns eventos)
     */
    private DeliveryData data;
    
    /**
     * Informações do motorista
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CourierData {
        private String name;
        
        @JsonProperty("phone_number")
        private String phoneNumber;
        
        private LocationCoordinates location;
        
        private VehicleData vehicle;
    }
    
    /**
     * Coordenadas de localização do motorista
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LocationCoordinates {
        private Double latitude;
        private Double longitude;
        
        /**
         * Direção do veículo em graus (0-360, onde 0 = Norte)
         */
        private Integer bearing;
    }
    
    /**
     * Informações do veículo do motorista
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VehicleData {
        
        @JsonProperty("license_plate")
        private String licensePlate;
        
        private String make;
        private String model;
        private String color;
    }
    
    /**
     * Dados de localização (pickup/dropoff)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LocationData {
        /**
         * Tempo estimado de chegada (ETA)
         */
        private Instant eta;
        
        /**
         * Dados de verificação da entrega
         */
        private VerificationData verification;
        
        /**
         * Endereço completo (presente em alguns eventos)
         */
        private String address;
    }
    
    /**
     * Dados de verificação de entrega
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VerificationData {
        /**
         * Código de verificação (PIN)
         */
        private String code;
        
        /**
         * Se a verificação foi concluída
         */
        private Boolean verified;
    }
    
    /**
     * Metadados do webhook
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MetaData {
        /**
         * ID do recurso (delivery_id)
         */
        @JsonProperty("resource_id")
        private String resourceId;
        
        /**
         * ID do usuário que disparou o evento
         */
        @JsonProperty("user_id")
        private String userId;
    }
    
    /**
     * Dados completos da entrega (estrutura aninhada em alguns eventos)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DeliveryData {
        private String id;
        private String status;
        private CourierData courier;
        private LocationData pickup;
        private LocationData dropoff;
        
        @JsonProperty("tracking_url")
        private String trackingUrl;
        
        @JsonProperty("created_at")
        private Instant createdAt;
        
        @JsonProperty("updated_at")
        private Instant updatedAt;
    }
}
