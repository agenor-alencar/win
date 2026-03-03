-- Criação da tabela de dados bancários dos lojistas
-- Para criação automática de recipients no Pagar.me

CREATE TABLE IF NOT EXISTS dados_bancarios_lojista (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lojista_id UUID NOT NULL UNIQUE,
    
    -- Dados do titular
    titular_nome VARCHAR(200) NOT NULL,
    titular_documento VARCHAR(14) NOT NULL,
    titular_tipo VARCHAR(20) NOT NULL CHECK (titular_tipo IN ('individual', 'company')),
    
    -- Dados bancários
    codigo_banco VARCHAR(3) NOT NULL,
    agencia VARCHAR(10) NOT NULL,
    agencia_dv VARCHAR(1),
    conta VARCHAR(20) NOT NULL,
    conta_dv VARCHAR(2) NOT NULL,
    tipo_conta VARCHAR(20) NOT NULL CHECK (tipo_conta IN ('conta_corrente', 'conta_poupanca')),
    
    -- Status
    validado BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign Key
    CONSTRAINT fk_dados_bancarios_lojista FOREIGN KEY (lojista_id) REFERENCES lojistas(id) ON DELETE CASCADE
);

-- Índice para busca rápida por lojista
CREATE INDEX IF NOT EXISTS idx_dados_bancarios_lojista ON dados_bancarios_lojista(lojista_id);

-- Comentários
COMMENT ON TABLE dados_bancarios_lojista IS 'Dados bancários dos lojistas para criação de recipients no Pagar.me';
COMMENT ON COLUMN dados_bancarios_lojista.titular_tipo IS 'Tipo do titular: individual (CPF) ou company (CNPJ)';
COMMENT ON COLUMN dados_bancarios_lojista.tipo_conta IS 'Tipo da conta: conta_corrente ou conta_poupanca';
COMMENT ON COLUMN dados_bancarios_lojista.validado IS 'Se a conta foi validada/criada no Pagar.me';
