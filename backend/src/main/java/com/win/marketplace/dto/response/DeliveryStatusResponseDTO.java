package com.win.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO de resposta com status atualizado da entrega Uber.
 * 
 * Baseado na resposta da API Uber Direct:
 * GET /v1/customers/me/deliveries/{delivery_id}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStatusResponseDTO {
    
    /**
     * ID da entrega na Uber
     */
    private String deliveryId;
    
    /**
     * Status atual da entrega
     * Valores: pending, pickup, pickup_complete, dropoff, delivered, cancelled
     */
    private String status;
    
    /**
     * URL de rastreamento para compartilhar com cliente
     */
    private String trackingUrl;
    
    /**
     * Informações do motorista
     */
    private CourierInfo courier;
    
    /**
     * Informações de pickup (retirada)
     */
    private LocationInfo pickup;
    
    /**
     * Informações de dropoff (entrega)
     */
    private LocationInfo dropoff;
    
    /**
     * Timestamp da última atualização
     */
    private Instant updatedAt;
    
    /**
     * Informações do motorista
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourierInfo {
        private String name;
        private String phoneNumber;
        private Double latitude;
        private Double longitude;
        private Integer bearing; // direção em graus (0-360)
        private VehicleInfo vehicle;
    }
    
    /**
     * Informações do veículo
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleInfo {
        private String make;
        private String model;
        private String licensePlate;
        private String color;
    }
    
    /**
     * Informações de localização (pickup/dropoff)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationInfo {
        private Instant eta; // previsão de chegada
        private String verificationCode;
        private Boolean verified;
    }
}
