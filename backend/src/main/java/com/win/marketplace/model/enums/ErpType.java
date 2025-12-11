package com.win.marketplace.model.enums;

/**
 * Tipos de ERP suportados pelo sistema Win
 */
public enum ErpType {
    /**
     * Sistema NavSoft ERP
     */
    NAVSOFT("NavSoft ERP", "https://api.navsoft.com.br"),
    
    /**
     * Sistema Tiny ERP
     */
    TINY("Tiny ERP", "https://api.tiny.com.br"),
    
    /**
     * API customizada (genérica)
     */
    CUSTOM_API("API Customizada", null),
    
    /**
     * Sem integração - cadastro manual apenas
     */
    MANUAL("Manual (Sem ERP)", null);
    
    private final String displayName;
    private final String defaultApiUrl;
    
    ErpType(String displayName, String defaultApiUrl) {
        this.displayName = displayName;
        this.defaultApiUrl = defaultApiUrl;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDefaultApiUrl() {
        return defaultApiUrl;
    }
    
    public boolean requiresApiKey() {
        return this != MANUAL;
    }
}
