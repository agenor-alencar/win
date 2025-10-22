package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProdutoResponseDTO(
    UUID id,
    LojistaBasicInfoDTO lojista,
    CategoriaBasicInfoDTO categoria,
    String nome,
    String descricao,
    BigDecimal preco,
    Integer estoque,
    BigDecimal pesoKg,
    BigDecimal comprimentoCm,
    BigDecimal larguraCm,
    BigDecimal alturaCm,
    Boolean ativo,
    BigDecimal avaliacao,
    Integer quantidadeAvaliacoes,
    List<String> imagensUrls,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime criadoEm,
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    OffsetDateTime atualizadoEm
) {
    public record LojistaBasicInfoDTO(
        UUID id,
        String nomeFantasia,
        String cnpj
    ) {}
    
    public record CategoriaBasicInfoDTO(
        UUID id,
        String nome
    ) {}
}
