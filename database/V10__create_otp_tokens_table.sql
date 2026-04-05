-- ============================================================================================================
-- SCRIPT DE MIGRAÇÃO: Implementação do Sistema de Autenticação via OTP SMS
-- ============================================================================================================
-- Descrição: Cria tabela otp_tokens para armazenar códigos OTP com TTL automático
-- Data: 2024-04-05
-- Versão: 1.0
-- ============================================================================================================

-- ✅ Criar tabela otp_tokens
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

-- ✅ Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_otp_telefone ON otp_tokens(telefone);
CREATE INDEX IF NOT EXISTS idx_otp_valido ON otp_tokens(valido);
CREATE INDEX IF NOT EXISTS idx_otp_expiracao ON otp_tokens(expiracao);
CREATE INDEX IF NOT EXISTS idx_otp_telefone_valido ON otp_tokens(telefone, valido);

-- ✅ Comentários descritivos
COMMENT ON TABLE otp_tokens IS 'Armazena códigos OTP temporários (One-Time Password) para autenticação via SMS. TTL: 5 minutos';
COMMENT ON COLUMN otp_tokens.id IS 'Identificador único (UUID)';
COMMENT ON COLUMN otp_tokens.telefone IS 'Número de telefone do usuário (formato internacional: +5511999999999)';
COMMENT ON COLUMN otp_tokens.codigo IS 'Código numérico de 6 dígitos enviado via SMS';
COMMENT ON COLUMN otp_tokens.tentativas IS 'Contador de tentativas de validação (máximo: 3)';
COMMENT ON COLUMN otp_tokens.valido IS 'Flag de validade: true = pode ser usado, false = expirou ou foi usado';
COMMENT ON COLUMN otp_tokens.expiracao IS 'Timestamp de expiração do código (TTL: 5 minutos após criação)';
COMMENT ON COLUMN otp_tokens.criado_em IS 'Timestamp de criação do registro (imutável)';
COMMENT ON COLUMN otp_tokens.atualizado_em IS 'Timestamp da última atualização (incrementado em cada mudança)';

-- ✅ Trigger para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION update_otp_tokens_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_otp_tokens_update ON otp_tokens;
CREATE TRIGGER trigger_otp_tokens_update
BEFORE UPDATE ON otp_tokens
FOR EACH ROW
EXECUTE FUNCTION update_otp_tokens_atualizado_em();

-- ============================================================================================================
-- QUERIES ÚTEIS PARA DEBUG E MONITORAMENTO
-- ============================================================================================================

-- 📊 Ver estatísticas de OTP
-- SELECT 
--     COUNT(*) as total_otps,
--     SUM(CASE WHEN valido THEN 1 ELSE 0 END) as otps_validos,
--     SUM(CASE WHEN expiracao > NOW() THEN 1 ELSE 0 END) as otps_nao_expirados,
--     COUNT(DISTINCT telefone) as telefones_unicos
-- FROM otp_tokens;

-- 📂 Ver últimos OTPs solicitados
-- SELECT 
--     telefone, codigo, tentativas, valido, expiracao, criado_em
-- FROM otp_tokens
-- ORDER BY criado_em DESC
-- LIMIT 50;

-- 🔍 Ver OTPs para um telefone específico
-- SELECT 
--     telefone, codigo, tentativas, valido, expiracao, criado_em
-- FROM otp_tokens
-- WHERE telefone = '+5511987654321'
-- ORDER BY criado_em DESC
-- LIMIT 10;

-- 🗑️ Limpar OTPs expirados (EXECUTAR PERIODICAMENTE)
-- DELETE FROM otp_tokens WHERE expiracao < NOW();

-- ============================================================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- ============================================================================================================
