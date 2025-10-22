package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoCreateRequestDTO(
    
    @NotNull(message = "ID da categoria é obrigatório")
    UUID categoriaId,
    
    @NotBlank(message = "Nome do produto é obrigatório")
    @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
    String nome,
    
    @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
    String descricao,
    
    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    @Digits(integer = 8, fraction = 2, message = "Preço inválido")
    BigDecimal preco,
    
    @Min(value = 0, message = "Estoque não pode ser negativo")
    Integer estoque,
    
    @DecimalMin(value = "0.001", message = "Peso deve ser maior que zero")
    @Digits(integer = 5, fraction = 3, message = "Peso inválido (máx: 99999.999 kg)")
    BigDecimal pesoKg,
    
    @DecimalMin(value = "0.01", message = "Comprimento deve ser maior que zero")
    @Digits(integer = 6, fraction = 2, message = "Comprimento inválido")
    BigDecimal comprimentoCm,
    
    @DecimalMin(value = "0.01", message = "Largura deve ser maior que zero")
    @Digits(integer = 6, fraction = 2, message = "Largura inválido")
    BigDecimal larguraCm,
    
    @DecimalMin(value = "0.01", message = "Altura deve ser maior que zero")
    @Digits(integer = 6, fraction = 2, message = "Altura inválido")
    BigDecimal alturaCm,
    
    Boolean ativo
) {}
