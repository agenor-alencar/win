package com.sistemawin.dto.response;

import com.sistemawin.domain.enums.ProductCategory;
import com.sistemawin.domain.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private ProductCategory category;
    private ProductStatus status;
    private Long storeId; // ID da loja para a qual o produto pertence
    private String storeName; // Nome da loja para exibição no frontend
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
