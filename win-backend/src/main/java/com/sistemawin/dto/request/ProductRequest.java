package com.sistemawin.dto.request;

import com.sistemawin.domain.enums.ProductCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Nome do produto é obrigatório")
    private String name;

    @NotBlank(message = "Descrição do produto é obrigatória")
    private String description;

    @NotNull(message = "Preço do produto é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    private BigDecimal price;

    @NotNull(message = "Categoria do produto é obrigatória")
    private ProductCategory category;

    @NotNull(message = "ID da loja é obrigatório")
    private Long storeId; // Para associar o produto a uma loja existente
}
