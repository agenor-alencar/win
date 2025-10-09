package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProdutoResponseDTO(
    UUID id,
    UUID lojistaId,
    String lojistaNome,
    String nome,
    String descricao,
    BigDecimal preco,
    UUID categoriaId,
    String categoriaNome,
    Integer estoque,
    String sku,
    BigDecimal peso,
    String unidadeMedida,
    String marca,
    String modelo,
    String caracteristicas,
    String status, // ATIVO, INATIVO, INDISPONIVEL
    BigDecimal avaliacaoMedia,
    Integer totalAvaliacoes,
    List<ImagemProdutoResponseDTO> imagens,
    List<VariacaoProdutoResponseDTO> variacoes,
    OffsetDateTime dataCriacao,
    OffsetDateTime dataAtualizacao
) {}
