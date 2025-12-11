-- Cria tabela de configuração ERP por lojista
CREATE TABLE IF NOT EXISTS lojista_erp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lojista_id UUID NOT NULL UNIQUE,
    erp_type VARCHAR(50) NOT NULL,
    api_url VARCHAR(500),
    api_key_encrypted VARCHAR(1000),
    access_token_encrypted VARCHAR(1000),
    sync_frequency_minutes INTEGER NOT NULL DEFAULT 5,
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMP,
    last_sync_status VARCHAR(50),
    last_sync_error TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP,
    
    CONSTRAINT fk_lojista_erp_config_lojista 
        FOREIGN KEY (lojista_id) REFERENCES lojistas(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_erp_type 
        CHECK (erp_type IN ('NAVSOFT', 'TINY', 'CUSTOM_API', 'MANUAL')),
    
    CONSTRAINT chk_sync_frequency 
        CHECK (sync_frequency_minutes >= 1)
);

-- Índices para melhorar performance
CREATE INDEX idx_lojista_erp_config_lojista ON lojista_erp_config(lojista_id);
CREATE INDEX idx_lojista_erp_config_sync ON lojista_erp_config(ativo, sync_enabled, erp_type) 
    WHERE ativo = true AND sync_enabled = true;

-- Comentários
COMMENT ON TABLE lojista_erp_config IS 'Configurações de integração com ERPs por lojista';
COMMENT ON COLUMN lojista_erp_config.erp_type IS 'Tipo de ERP: NAVSOFT, TINY, CUSTOM_API, MANUAL';
COMMENT ON COLUMN lojista_erp_config.api_key_encrypted IS 'API Key criptografada com AES-256';
COMMENT ON COLUMN lojista_erp_config.sync_frequency_minutes IS 'Frequência de sincronização em minutos';
COMMENT ON COLUMN lojista_erp_config.last_sync_at IS 'Última sincronização bem-sucedida';
