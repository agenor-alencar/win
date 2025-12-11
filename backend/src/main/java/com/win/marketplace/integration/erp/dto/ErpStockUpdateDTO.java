package com.win.marketplace.integration.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para atualização de estoque de um produto
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErpStockUpdateDTO {
    
    /**
     * SKU do produto
     */
    private String sku;
    
    /**
     * Novo saldo de estoque
     */
    private Integer estoque;
    
    /**
     * Se o produto está ativo no ERP
     */
    private Boolean ativo;
}
