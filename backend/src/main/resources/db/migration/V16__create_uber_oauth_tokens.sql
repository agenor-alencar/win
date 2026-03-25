-- V16__create_uber_oauth_tokens.sql
-- Criar tabela para armazenar tokens OAuth da Uber Direct

CREATE TABLE IF NOT EXISTS uber_oauth_tokens (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    token_type VARCHAR(50) NOT NULL DEFAULT 'Bearer',
    scope VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT true,
    expira_em TIMESTAMP NOT NULL,
    motivo_desativacao VARCHAR(500),
    total_usos INTEGER NOT NULL DEFAULT 0,
    ultimo_uso TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_uber_oauth_tokens_customer_id 
    ON uber_oauth_tokens(customer_id);

CREATE INDEX IF NOT EXISTS idx_uber_oauth_tokens_ativo_expira 
    ON uber_oauth_tokens(ativo, expira_em);

-- Tabela para histórico de sincronizações
CREATE TABLE IF NOT EXISTS uber_sync_log (
    id BIGSERIAL PRIMARY KEY,
    tipo_sincronizacao VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    mensagem TEXT,
    quantidade_registros INTEGER,
    tempo_duracao_ms BIGINT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uber_sync_log_tipo_status 
    ON uber_sync_log(tipo_sincronizacao, status);
