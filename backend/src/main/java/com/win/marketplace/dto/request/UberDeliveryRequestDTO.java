package com.win.marketplace.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para requisição de criação de entrega via Uber Direct
 * 
 * Enviado para: POST /v1/customers/{customer_id}/deliveries
 * 
 * IMPORTANTE: Contém PIN codes obrigatórios para:
 * - Pickup: Lojista confirma com motorista (4-6 dígitos)
 * - Delivery: Motor confirmatory com cliente (4-6 dígitos)
 * 
 * Exemplo:
 * {
 *   "quote_id": "fba8597b-b3ad-4b10-a17b-f8b9b80e3e71",
 *   "order_reference_id": "pedido-12345",
 *   "pickup_address": {
 *     "address": "Rua A, 123",
 *     "latitude": -23.5505,
 *     "longitude": -46.6333
 *   },
 *   "dropoff_address": {
 *     "address": "Rua B, 456", 
 *     "latitude": -23.5505,
 *     "longitude": -46.6333
 *   },
 *   "pickup_phone_number": "+55 11 98765-4321",
 *   "dropoff_phone_number": "+55 11 99876-5432",
 *   "dropoff_name": "João Silva",
 *   "dropoff_notes": "Apto 321, buzina não toca",
 *   "pickup_instructions": "Chamar quando chegar",
 *   "dropoff_instructions": "Deixar no portão",
 *   "pickup_pin_code": "1234",
 *   "delivery_pin_code": "5678"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UberDeliveryRequestDTO {
    
    /**
     * ID da cotação (obtido do Step 3)
     */
    @NotBlank(message = "Quote ID é obrigatório")
    @JsonProperty("quote_id")
    private String quoteId;
    
    /**
     * ID externo da entrega (para rastreamento)
     * Deve ser único
     */
    @NotBlank(message = "Order reference ID é obrigatório")
    @JsonProperty("order_reference_id")
    private String pedidoId;
    
    /**
     * Informações do ponto de coleta (lojista)
     */
    @NotNull(message = "Endereço de coleta é obrigatório")
    @JsonProperty("pickup_address")
    private EnderecoDTO enderecoColeta;
    
    /**
     * Informações do ponto de entrega (cliente)
     */
    @NotNull(message = "Endereço de entrega é obrigatório")
    @JsonProperty("dropoff_address")
    private EnderecoDTO enderecoEntrega;
    
    /**
     * Telefone do ponto de coleta (lojista)
     * Formato: +55 11 98765-4321
     */
    @NotBlank(message = "Telefone de coleta é obrigatório")
    @JsonProperty("pickup_phone_number")
    private String telefoneLojista;
    
    /**
     * Telefone do cliente (para contact pelo motorista)
     * Formato: +55 11 99876-5432
     */
    @NotBlank(message = "Telefone de entrega é obrigatório")
    @JsonProperty("dropoff_phone_number")
    private String telefoneCliente;
    
    /**
     * Nome do cliente (para verificação na entrega)
     */
    @NotBlank(message = "Nome para entrega é obrigatório")
    @JsonProperty("dropoff_name")
    private String nomeCliente;
    
    /**
     * Notas especiais para o ponto de entrega
     * Ex: "Apto 321", "Prédio com portaria", "Deixar na recepção"
     */
    @JsonProperty("dropoff_notes")
    private String notasEntrega;
    
    /**
     * Instruções especiais para coleta
     * Ex: "Chamar para descer", "Está pronto na portaria"
     */
    @JsonProperty("pickup_instructions")
    private String instrucoesColeta;
    
    /**
     * Instruções especiais para entrega
     * Ex: "Deixar no portão", "Buzina não toca"
     */
    @JsonProperty("dropoff_instructions")
    private String instrucoesEntrega;
    
    /**
     * ⚠️ PIN CODE OBRIGATÓRIO (Proof of Delivery)
     * Usado pelo LOJISTA para confirmar coleta ao motorista
     * 
     * Deve conter 4-6 dígitos
     * O motorista fornecerá este código ao lojista
     * Lojista digita para confirmar que pegou o pedido
     */
    @NotBlank(message = "PIN de coleta é obrigatório - exigido para confirmação do lojista")
    @Size(min = 4, max = 6, message = "PIN de coleta deve ter entre 4 e 6 dígitos")
    @JsonProperty("pickup_pin_code")
    private String pinColeta;
    
    /**
     * ⚠️ PIN CODE OBRIGATÓRIO (Proof of Delivery)
     * Usado pelo CLIENTE para confirmar entrega
     * 
     * Deve conter 4-6 dígitos
     * O motorista fornecerá este código ao cliente
     * Cliente digita para confirmar que recebeu o pedido
     */
    @NotBlank(message = "PIN de entrega é obrigatório - exigido para confirmação do cliente")
    @Size(min = 4, max = 6, message = "PIN de entrega deve ter entre 4 e 6 dígitos")
    @JsonProperty("delivery_pin_code")
    private String pinEntrega;
    
    /**
     * DTO interno para endereço
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnderecoDTO {
        
        /**
         * Endereço em texto
         */
        @NotBlank(message = "Endereço não pode estar vazio")
        @JsonProperty("address")
        private String endereco;
        
        /**
         * Latitude do ponto
         */
        @NotNull(message = "Latitude é obrigatória")
        @JsonProperty("latitude")
        private Double latitude;
        
        /**
         * Longitude do ponto
         */
        @NotNull(message = "Longitude é obrigatória")
        @JsonProperty("longitude")
        private Double longitude;
    }
}
