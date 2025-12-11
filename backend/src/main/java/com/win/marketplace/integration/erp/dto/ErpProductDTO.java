package com.win.marketplace.integration.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para representar um produto retornado da API do ERP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErpProductDTO {
    
    /**
     * SKU do produto no ERP (identificador único)
     */
    private String sku;
    
    /**
     * Nome do produto
     */
    private String nome;
    
    /**
     * Descrição detalhada
     */
    private String descricao;
    
    /**
     * Preço de venda
     */
    private BigDecimal preco;
    
    /**
     * Estoque disponível
     */
    private Integer estoque;
    
    /**
     * Código de barras (EAN)
     */
    private String codigoBarras;
    
    /**
     * Peso em gramas
     */
    private Integer pesoGramas;
    
    /**
     * URL da imagem principal (se disponível)
     */
    private String imagemUrl;
    
    /**
     * Marca/fabricante
     */
    private String marca;
    
    /**
     * Categoria no ERP
     */
    private String categoria;
    
    /**
     * Se o produto está ativo no ERP
     */
    private Boolean ativo;
}
