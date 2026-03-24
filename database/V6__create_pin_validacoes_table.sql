-- Migration: Criar tabela pin_validacoes para armazenar validações de PIN
-- Responsável: Sistema de Entrega (Proof of Delivery)
-- Data: 2026-03-24

CREATE TABLE IF NOT EXISTS pin_validacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento com entrega
    entrega_id UUID NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
    
    -- PIN Criptografado (AES-256-GCM)
    pin_encriptado TEXT NOT NULL,
    iv VARCHAR(255) NOT NULL,  -- IV em Base64 (96 bits = 12 bytes = 16 chars Base64)
    salt VARCHAR(255) NOT NULL,  -- Salt em Base64 (128 bits = 16 bytes = 24 chars Base64)
    
    -- Tipo de validação
    tipo_pin VARCHAR(20) NOT NULL,  -- 'COLETA' ou 'ENTREGA'
    
    -- Controle de tentativas
    numero_tentativas INTEGER NOT NULL DEFAULT 0,
    max_tentativas INTEGER NOT NULL DEFAULT 3,
    
    -- Status de validação
    validado BOOLEAN NOT NULL DEFAULT FALSE,
    data_validacao TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    usuario_validador_id UUID,
    ip_address VARCHAR(45),  -- Suporta IPv6
    user_agent TEXT,
    
    -- Proteção contra brute force
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    motivo_falha VARCHAR(255),
    
    -- Metadados temporais
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,  -- PIN expira em 24h
    
    -- Constraints
    CONSTRAINT pin_validacoes_max_tentativas_check CHECK (numero_tentativas >= 0 AND numero_tentativas <= max_tentativas),
    CONSTRAINT pin_validacoes_tipo_check CHECK (tipo_pin IN ('COLETA', 'ENTREGA'))
);

-- Índices para melhorar performance de queries
CREATE INDEX idx_pin_entrega_id ON pin_validacoes(entrega_id);
CREATE INDEX idx_pin_tipo ON pin_validacoes(tipo_pin);
CREATE INDEX idx_pin_bloqueado_ate ON pin_validacoes(bloqueado_ate);
CREATE INDEX idx_pin_criado_em ON pin_validacoes(criado_em);
CREATE INDEX idx_pin_validado ON pin_validacoes(validado);
CREATE INDEX idx_pin_expira_em ON pin_validacoes(expira_em);

-- Índice composto para buscar PIN ativo de uma entrega
CREATE INDEX idx_pin_entrega_tipo_validado ON pin_validacoes(entrega_id, tipo_pin, validado);

-- Trigger para atualizar atualizado_em automaticamente (PostgreSQL)
CREATE OR REPLACE FUNCTION atualizar_pin_validacoes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pin_validacoes_timestamp ON pin_validacoes;
CREATE TRIGGER trigger_pin_validacoes_timestamp
    BEFORE UPDATE ON pin_validacoes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_pin_validacoes_timestamp();

-- Comentários descritivos para documentação
COMMENT ON TABLE pin_validacoes IS 'Armazena validações de PIN codes com proteção contra brute force (max 3 tentativas, bloqueio 15min)';
COMMENT ON COLUMN pin_validacoes.pin_encriptado IS 'PIN criptografado com AES-256-GCM';
COMMENT ON COLUMN pin_validacoes.iv IS 'Initialization Vector (96 bits) em Base64';
COMMENT ON COLUMN pin_validacoes.salt IS 'Salt para derivação de chave em Base64';
COMMENT ON COLUMN pin_validacoes.tipo_pin IS 'COLETA (motorista) ou ENTREGA (cliente)';
COMMENT ON COLUMN pin_validacoes.numero_tentativas IS 'Contador de tentativas de validação';
COMMENT ON COLUMN pin_validacoes.bloqueado_ate IS 'Timestamp até o qual está bloqueado por brute force';
COMMENT ON COLUMN pin_validacoes.expira_em IS 'PIN expira automaticamente após 24 horas';
