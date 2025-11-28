package com.win.marketplace.dto.request;

import com.win.marketplace.model.enums.StatusEntrega;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO para processar webhooks da Uber Flash.
 * Recebe atualizações de status da corrida.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UberWebhookDTO {

    /**
     * ID da corrida Uber (para localizar a entrega).
     */
    private String idCorridaUber;
    
    /**
     * Novo status da corrida.
     * Mapear os status da Uber para StatusEntrega.
     */
    private String statusUber;
    
    /**
     * Timestamp do evento.
     */
    private OffsetDateTime dataHoraEvento;
    
    /**
     * Dados do motorista (podem ser atualizados).
     */
    private String nomeMotorista;
    private String placaVeiculo;
    private String contatoMotorista;
    
    /**
     * Localização atual (latitude, longitude) - opcional.
     */
    private Double latitude;
    private Double longitude;
    
    /**
     * Mensagem adicional da Uber.
     */
    private String mensagem;
    
    /**
     * Mapeia o status da Uber para nosso enum StatusEntrega.
     */
    public StatusEntrega mapearStatusEntrega() {
        if (statusUber == null) {
            return null;
        }
        
        return switch (statusUber.toUpperCase()) {
            case "DRIVER_ASSIGNED", "DRIVER_EN_ROUTE_TO_PICKUP" -> StatusEntrega.MOTORISTA_A_CAMINHO_RETIRADA;
            case "PICKED_UP", "DRIVER_EN_ROUTE_TO_DROPOFF" -> StatusEntrega.EM_TRANSITO;
            case "DELIVERED", "COMPLETED" -> StatusEntrega.ENTREGUE;
            case "CANCELLED" -> StatusEntrega.CANCELADA;
            case "FAILED" -> StatusEntrega.FALHA_SOLICITACAO;
            default -> StatusEntrega.AGUARDANDO_MOTORISTA;
        };
    }
}
