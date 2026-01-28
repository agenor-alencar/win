package com.win.marketplace.integration.erp.impl;

import com.win.marketplace.integration.erp.ErpApiClient;
import com.win.marketplace.integration.erp.dto.ErpProductDTO;
import com.win.marketplace.integration.erp.dto.ErpStockUpdateDTO;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

/**
 * Implementação para produtos cadastrados manualmente (sem ERP)
 */
@Slf4j
public class ManualErpClient implements ErpApiClient {
    
    @Override
    public Optional<ErpProductDTO> getErpProduct(String sku) {
        log.warn("Tentativa de buscar produto de ERP manual - SKU: {}", sku);
        return Optional.empty();
    }
    
    @Override
    public List<ErpStockUpdateDTO> getStockUpdates(List<String> skus) {
        log.warn("Tentativa de sincronizar estoque de ERP manual");
        return List.of();
    }
    
    @Override
    public boolean testConnection() {
        return true; // Sempre válido para modo manual
    }
    
    @Override
    public String getErpName() {
        return "Manual";
    }
}
