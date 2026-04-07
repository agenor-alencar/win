-- ========================================
-- CREATE TABELA OTP_TOKENS
-- ========================================
-- Tabela para armazenar códigos OTP (One-Time Password) 
-- enviados via SMS para autenticação de usuários

CREATE TABLE IF NOT EXISTS otp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telefone VARCHAR(20) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    tentativas INTEGER NOT NULL DEFAULT 0,
    valido BOOLEAN NOT NULL DEFAULT true,
    expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_otp_telefone ON otp_tokens(telefone);
CREATE INDEX IF NOT EXISTS idx_otp_valido ON otp_tokens(valido);
CREATE INDEX IF NOT EXISTS idx_otp_expiracao ON otp_tokens(expiracao);
CREATE INDEX IF NOT EXISTS idx_otp_telefone_valido ON otp_tokens(telefone, valido);
