package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProdutoSummaryResponseDTO(
    UUID id,
    String nome,
    BigDecimal preco,
    String categoriaNome,
    String lojistaNome,
    Integer estoque,
    String status, // ATIVO, INATIVO, INDISPONIVEL
    BigDecimal avaliacaoMedia,
    Integer totalAvaliacoes,
    String imagemPrincipal
) {}
