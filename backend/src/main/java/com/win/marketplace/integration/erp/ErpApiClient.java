package com.win.marketplace.integration.erp;

import com.win.marketplace.integration.erp.dto.ErpProductDTO;
import com.win.marketplace.integration.erp.dto.ErpStockUpdateDTO;

import java.util.List;
import java.util.Optional;

/**
 * Interface comum para clientes de API de ERP.
 * Cada implementação (NavSoft, Tiny, etc) deve seguir este contrato.
 */
public interface ErpApiClient {
    
    /**
     * Busca informações completas de um produto pelo SKU
     * 
     * @param sku SKU do produto no ERP
     * @return Dados do produto ou Optional.empty() se não encontrado
     * @throws ErpIntegrationException em caso de erro na comunicação
     */
    Optional<ErpProductDTO> getErpProduct(String sku);
    
    /**
     * Busca atualizações de estoque para múltiplos SKUs
     * 
     * @param skus Lista de SKUs para consultar
     * @return Lista de atualizações de estoque
     * @throws ErpIntegrationException em caso de erro na comunicação
     */
    List<ErpStockUpdateDTO> getStockUpdates(List<String> skus);
    
    /**
     * Testa a conexão com o ERP usando as credenciais configuradas
     * 
     * @return true se a conexão foi bem-sucedida
     * @throws ErpIntegrationException em caso de erro
     */
    boolean testConnection();
    
    /**
     * Retorna o nome do ERP (ex: "NavSoft", "Tiny")
     */
    String getErpName();
}
