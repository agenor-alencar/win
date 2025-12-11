package com.win.marketplace.integration.erp;

import com.win.marketplace.integration.erp.impl.ManualErpClient;
import com.win.marketplace.integration.erp.impl.NavSoftApiClient;
import com.win.marketplace.integration.erp.impl.TinyApiClient;
import com.win.marketplace.model.LojistaErpConfig;
import com.win.marketplace.model.enums.ErpType;
import com.win.marketplace.service.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Factory para criar instâncias de clientes ERP baseado na configuração do lojista.
 * Aplica o padrão Factory + Strategy para injeção dinâmica de dependências.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ErpClientFactory {
    
    private final EncryptionService encryptionService;
    
    /**
     * Cria uma instância do cliente ERP apropriado baseado na configuração
     * 
     * @param config Configuração do ERP do lojista
     * @return Instância do cliente ERP configurado
     * @throws ErpIntegrationException se a configuração for inválida
     */
    public ErpApiClient createClient(LojistaErpConfig config) {
        if (config == null || !config.getAtivo()) {
            log.warn("Tentativa de criar cliente para configuração inativa ou nula");
            return new ManualErpClient();
        }
        
        ErpType erpType = config.getErpType();
        log.info("Criando cliente ERP do tipo: {}", erpType);
        
        return switch (erpType) {
            case NAVSOFT -> createNavSoftClient(config);
            case TINY -> createTinyClient(config);
            case CUSTOM_API -> createCustomApiClient(config);
            case MANUAL -> new ManualErpClient();
        };
    }
    
    private ErpApiClient createNavSoftClient(LojistaErpConfig config) {
        String apiKey = decryptApiKey(config);
        String apiUrl = config.getApiUrl() != null ? config.getApiUrl() : ErpType.NAVSOFT.getDefaultApiUrl();
        
        return new NavSoftApiClient(apiUrl, apiKey);
    }
    
    private ErpApiClient createTinyClient(LojistaErpConfig config) {
        String apiToken = decryptApiKey(config);
        String apiUrl = config.getApiUrl() != null ? config.getApiUrl() : ErpType.TINY.getDefaultApiUrl();
        
        return new TinyApiClient(apiUrl, apiToken);
    }
    
    private ErpApiClient createCustomApiClient(LojistaErpConfig config) {
        // Para APIs customizadas, pode-se usar um cliente genérico ou REST simples
        // Por enquanto, retorna ManualErpClient (implementar quando necessário)
        log.warn("API customizada ainda não implementada - retornando ManualErpClient");
        return new ManualErpClient();
    }
    
    private String decryptApiKey(LojistaErpConfig config) {
        if (config.getApiKeyEncrypted() == null) {
            throw new ErpIntegrationException("API Key não configurada para o lojista");
        }
        
        try {
            return encryptionService.decrypt(config.getApiKeyEncrypted());
        } catch (Exception e) {
            log.error("Erro ao descriptografar API Key", e);
            throw new ErpIntegrationException("Erro ao descriptografar credenciais do ERP", e);
        }
    }
}
