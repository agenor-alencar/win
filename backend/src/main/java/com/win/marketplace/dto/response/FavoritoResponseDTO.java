package com.win.marketplace.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoResponseDTO {
    
    private UUID id;
    private UUID produtoId;
    private String produtoNome;
    private BigDecimal produtoPreco;
    private String produtoImagem;
    private Boolean produtoEmEstoque;
    private LojistaSimples lojista;
    private OffsetDateTime criadoEm;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LojistaSimples {
        private UUID id;
        private String nomeFantasia;
    }
}
