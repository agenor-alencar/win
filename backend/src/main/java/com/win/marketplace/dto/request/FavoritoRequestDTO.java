package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoRequestDTO {
    
    @NotNull(message = "ID do produto é obrigatório")
    private UUID produtoId;
}
