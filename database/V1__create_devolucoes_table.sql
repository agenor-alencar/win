-- ============================================
-- Migração: Adicionar tabela de devoluções
-- ============================================
-- Data: 2024-11-12
-- Descrição: Cria tabela para gerenciamento de devoluções e reembolsos
-- Compatível com PostgreSQL e esquema existente

-- Verificar se a tabela já existe antes de criar
CREATE TABLE IF NOT EXISTS devolucoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_devolucao VARCHAR(20) UNIQUE NOT NULL,
    pedido_id UUID NOT NULL,
    item_pedido_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    lojista_id UUID NOT NULL,
    motivo_devolucao VARCHAR(30) NOT NULL,
    descricao TEXT,
    quantidade_devolvida INTEGER NOT NULL,
    valor_devolucao DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    justificativa_lojista TEXT,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_recusa TIMESTAMP WITH TIME ZONE,
    data_reembolso TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_devolucao_pedido FOREIGN KEY (pedido_id) 
        REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucao_item_pedido FOREIGN KEY (item_pedido_id) 
        REFERENCES itens_pedido(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucao_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucao_lojista FOREIGN KEY (lojista_id) 
        REFERENCES lojistas(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_quantidade_devolvida CHECK (quantidade_devolvida > 0),
    CONSTRAINT chk_valor_devolucao CHECK (valor_devolucao > 0),
    CONSTRAINT chk_motivo_devolucao CHECK (
        motivo_devolucao IN (
            'PRODUTO_DEFEITUOSO',
            'PRODUTO_DIFERENTE',
            'ARREPENDIMENTO',
            'PRODUTO_DANIFICADO',
            'ENTREGA_ATRASADA',
            'NAO_ATENDE_EXPECTATIVA',
            'OUTRO'
        )
    ),
    CONSTRAINT chk_status_devolucao CHECK (
        status IN (
            'PENDENTE',
            'APROVADO',
            'RECUSADO',
            'EM_TRANSITO',
            'RECEBIDO',
            'REEMBOLSADO',
            'CANCELADO'
        )
    )
);

-- Índices para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_devolucoes_numero ON devolucoes(numero_devolucao);
CREATE INDEX IF NOT EXISTS idx_devolucoes_pedido ON devolucoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_usuario ON devolucoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_lojista ON devolucoes(lojista_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_status ON devolucoes(status);
CREATE INDEX IF NOT EXISTS idx_devolucoes_criado_em ON devolucoes(criado_em);
CREATE INDEX IF NOT EXISTS idx_devolucoes_lojista_status ON devolucoes(lojista_id, status);

-- Comentários para documentação
COMMENT ON TABLE devolucoes IS 'Tabela de devoluções e reembolsos de produtos';
COMMENT ON COLUMN devolucoes.numero_devolucao IS 'Número único da devolução (formato: DEV-YYYYMMDDHHMMSS-XXXX)';
COMMENT ON COLUMN devolucoes.motivo_devolucao IS 'Motivo da solicitação de devolução';
COMMENT ON COLUMN devolucoes.status IS 'Status atual da devolução (PENDENTE, APROVADO, RECUSADO, etc)';
COMMENT ON COLUMN devolucoes.valor_devolucao IS 'Valor a ser reembolsado ao cliente';
COMMENT ON COLUMN devolucoes.justificativa_lojista IS 'Justificativa do lojista ao aprovar/recusar a devolução';

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Tabela devolucoes criada com sucesso!';
END $$;
