package com.win.marketplace.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO resumido para listagens de produtos (sem detalhes completos)
 */
public record ProdutoSummaryResponseDTO(
    UUID id,
    String nome,
    BigDecimal preco,
    Integer estoque,
    Boolean ativo,
    BigDecimal avaliacao,
    Integer quantidadeAvaliacoes,
    String imagemPrincipal, // Primeira imagem
    String nomeCategoria,
    String nomeLojista
) {}
