package com.win.marketplace.dto.request;

import com.win.marketplace.model.Devolucao;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO para criação de solicitação de devolução
 */
public record DevolucaoCreateRequestDTO(
    @NotNull(message = "ID do pedido é obrigatório")
    UUID pedidoId,
    
    @NotNull(message = "ID do item do pedido é obrigatório")
    UUID itemPedidoId,
    
    @NotNull(message = "Motivo da devolução é obrigatório")
    Devolucao.MotivoDevolucao motivoDevolucao,
    
    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 10, max = 1000, message = "Descrição deve ter entre 10 e 1000 caracteres")
    String descricao,
    
    @NotNull(message = "Quantidade devolvida é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser no mínimo 1")
    Integer quantidadeDevolvida,
    
    @NotNull(message = "Valor da devolução é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    BigDecimal valorDevolucao
) {}
