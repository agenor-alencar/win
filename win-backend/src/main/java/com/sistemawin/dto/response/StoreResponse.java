package com.sistemawin.dto.response;

import com.sistemawin.domain.enums.StoreCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {
    private Long id;
    private String name;
    private String description;
    private StoreCategory category;
    private Long merchantId; // ID do lojista dono da loja
    private String merchantName; // Nome do lojista para exibição no frontend
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
