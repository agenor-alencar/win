-- ====================================================================
-- Migration 003: Reestruturar Sistema de Entregas (Uber Flash)
-- ====================================================================
-- Descrição: Remove tabela entregas antiga, adiciona lojista_id em pedidos,
--            e cria nova tabela entregas para integração Uber Flash
-- Data: 2025-11-27
-- Autor: Win Marketplace Team
-- ====================================================================

BEGIN;

-- ===================================
-- PASSO 1: Remover apenas tabela entregas antiga
-- ===================================
-- IMPORTANTE: Mantemos tabela motoristas pois o sistema ainda usa motoristas próprios
-- A integração Uber Flash é ADICIONAL, não substitui motoristas próprios
DROP TABLE IF EXISTS entregas CASCADE;

-- ===================================
-- PASSO 2: Adicionar lojista_id em pedidos
-- ===================================
-- Verificar se coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pedidos' AND column_name = 'lojista_id'
    ) THEN
        ALTER TABLE pedidos ADD COLUMN lojista_id UUID;
        
        -- Adicionar constraint após popular dados
        -- NOTA: Em produção, você deve PRIMEIRO popular esta coluna
        -- baseado nos itens_pedido antes de torná-la NOT NULL
        ALTER TABLE pedidos 
            ADD CONSTRAINT fk_pedidos_lojista 
            FOREIGN KEY (lojista_id) 
            REFERENCES lojistas(id) 
            ON DELETE RESTRICT;
            
        -- Popular lojista_id baseado no primeiro item do pedido
        UPDATE pedidos p
        SET lojista_id = (
            SELECT ip.lojista_id 
            FROM itens_pedido ip 
            WHERE ip.pedido_id = p.id 
            LIMIT 1
        )
        WHERE lojista_id IS NULL;
        
        -- Tornar NOT NULL após popular
        ALTER TABLE pedidos ALTER COLUMN lojista_id SET NOT NULL;
        
        -- Criar índice
        CREATE INDEX idx_pedidos_lojista_id ON pedidos(lojista_id);
    END IF;
END $$;

-- ===================================
-- PASSO 3: Criar nova tabela entregas
-- ===================================

-- Criar tabela entregas
CREATE TABLE IF NOT EXISTS entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento com pedido
    pedido_id UUID NOT NULL UNIQUE,
    
    -- Tipo de veículo e valores
    tipo_veiculo_solicitado VARCHAR(50) NOT NULL, -- 'UBER_MOTO' ou 'UBER_CARRO'
    valor_corrida_uber DECIMAL(10, 2) NOT NULL, -- Valor bruto cobrado pela Uber
    valor_frete_cliente DECIMAL(10, 2) NOT NULL, -- Valor total cobrado do cliente (com taxa 10%)
    taxa_winmarket DECIMAL(10, 2) NOT NULL, -- Margem de lucro do Win (10%)
    
    -- Status e controle
    status_entrega VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_PREPARACAO',
    -- Status possíveis:
    -- - AGUARDANDO_PREPARACAO: Pedido criado, aguardando lojista preparar
    -- - AGUARDANDO_MOTORISTA: Pedido pronto, aguardando motorista aceitar
    -- - MOTORISTA_A_CAMINHO_RETIRADA: Motorista a caminho do lojista
    -- - EM_TRANSITO: Motorista retirou e está indo ao cliente
    -- - ENTREGUE: Pedido entregue ao cliente
    -- - CANCELADA: Entrega cancelada
    -- - FALHA_SOLICITACAO: Falha ao solicitar corrida à Uber
    
    -- Dados do motorista (preenchidos após aceite da Uber)
    nome_motorista VARCHAR(255),
    placa_veiculo VARCHAR(20),
    contato_motorista VARCHAR(20),
    
    -- IDs e códigos Uber
    id_corrida_uber VARCHAR(255), -- ID único da corrida retornado pela Uber
    codigo_retirada_uber VARCHAR(50), -- Código para lojista confirmar ao motorista
    codigo_entrega_uber VARCHAR(50), -- Código para motorista confirmar ao cliente
    url_rastreamento_uber VARCHAR(500), -- Link de rastreamento em tempo real
    
    -- Timestamps
    data_hora_solicitacao TIMESTAMP WITH TIME ZONE, -- Quando a corrida foi solicitada
    data_hora_retirada TIMESTAMP WITH TIME ZONE, -- Quando motorista retirou
    data_hora_entrega TIMESTAMP WITH TIME ZONE, -- Quando foi entregue
    
    -- Dados de auditoria (copiados do pedido para histórico)
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    endereco_entrega TEXT NOT NULL,
    
    -- Observações
    observacoes TEXT,
    
    -- Timestamps de controle
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_entrega_pedido 
        FOREIGN KEY (pedido_id) 
        REFERENCES pedidos(id) 
        ON DELETE CASCADE
);

-- Criar índices para otimização
CREATE INDEX idx_entrega_pedido_id ON entregas(pedido_id);
CREATE INDEX idx_entrega_status ON entregas(status_entrega);
CREATE INDEX idx_entrega_corrida_uber ON entregas(id_corrida_uber);
CREATE INDEX idx_entrega_data_solicitacao ON entregas(data_hora_solicitacao);

-- Criar trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_entregas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_entregas_timestamp
    BEFORE UPDATE ON entregas
    FOR EACH ROW
    EXECUTE FUNCTION update_entregas_timestamp();

-- Comentários na tabela
COMMENT ON TABLE entregas IS 'Registros de entregas terceirizadas via Uber Flash';
COMMENT ON COLUMN entregas.tipo_veiculo_solicitado IS 'Tipo de veículo: UBER_MOTO ou UBER_CARRO';
COMMENT ON COLUMN entregas.valor_corrida_uber IS 'Valor bruto da corrida cobrado pela Uber (sem margem)';
COMMENT ON COLUMN entregas.valor_frete_cliente IS 'Valor total cobrado do cliente (valor Uber + 10%)';
COMMENT ON COLUMN entregas.taxa_winmarket IS 'Margem de lucro do Win (10% do valor Uber)';
COMMENT ON COLUMN entregas.status_entrega IS 'Status atual da entrega';
COMMENT ON COLUMN entregas.codigo_retirada_uber IS 'Código que o lojista informa ao motorista na retirada';
COMMENT ON COLUMN entregas.codigo_entrega_uber IS 'Código que o motorista informa ao cliente na entrega';

-- Verificação final
SELECT 'Tabela entregas criada com sucesso!' as status;
SELECT COUNT(*) as total_entregas FROM entregas;

COMMIT;

-- ====================================================================
-- Para reverter esta migration (ROLLBACK):
-- ====================================================================
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_update_entregas_timestamp ON entregas;
-- DROP FUNCTION IF EXISTS update_entregas_timestamp();
-- DROP INDEX IF EXISTS idx_entrega_pedido_id;
-- DROP INDEX IF EXISTS idx_entrega_status;
-- DROP INDEX IF EXISTS idx_entrega_corrida_uber;
-- DROP INDEX IF EXISTS idx_entrega_data_solicitacao;
-- DROP TABLE IF EXISTS entregas CASCADE;
-- 
-- -- Remover lojista_id de pedidos se necessário
-- ALTER TABLE pedidos DROP COLUMN IF EXISTS lojista_id;
-- 
-- -- Recriar tabela entregas antiga (se necessário restaurar)
-- -- (copiar estrutura da V1__create_initial_tables.sql)
-- COMMIT;
