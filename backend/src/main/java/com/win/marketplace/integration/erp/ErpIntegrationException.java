package com.win.marketplace.integration.erp;

/**
 * Exceção para erros de integração com ERP
 */
public class ErpIntegrationException extends RuntimeException {
    
    public ErpIntegrationException(String message) {
        super(message);
    }
    
    public ErpIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
