package com.sistemawin.dto.request;

import com.sistemawin.domain.enums.StoreCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreRequest {
    @NotBlank(message = "Nome da loja é obrigatório")
    private String name;

    @NotBlank(message = "Descrição da loja é obrigatória")
    private String description;

    @NotNull(message = "Categoria da loja é obrigatória")
    private StoreCategory category;

    @NotNull(message = "ID do lojista é obrigatório")
    private Long merchantId; // Para associar a loja a um lojista existente
}
