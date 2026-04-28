-- Migração: Alterações para suporte a Logística Reversa Quick Commerce
-- Adiciona transaction_id_pagarme em devolucoes
-- Adiciona limite_estorno_automatico em lojista_erp_config
-- Expande constraints de enums de devolucoes

ALTER TABLE devolucoes
    ADD COLUMN IF NOT EXISTS transaction_id_pagarme VARCHAR(100);

ALTER TABLE lojista_erp_config
    ADD COLUMN IF NOT EXISTS limite_estorno_automatico DECIMAL(10,2) NOT NULL DEFAULT 20.00;

-- Atualiza constraints dos enums de devolução: removemos as antigas (se existirem) e adicionamos novas
ALTER TABLE devolucoes DROP CONSTRAINT IF EXISTS chk_status_devolucao;
ALTER TABLE devolucoes DROP CONSTRAINT IF EXISTS chk_motivo_devolucao;

ALTER TABLE devolucoes ADD CONSTRAINT chk_status_devolucao CHECK (
    status IN (
        'PENDENTE',
        'APROVADO',
        'RECUSADO',
        'EM_TRANSITO',
        'RECEBIDO',
        'REEMBOLSADO',
        'CANCELADO',
        'APROVADO_SEM_COLETA',
        'AGUARDANDO_ENTREGA_BALCAO'
    )
);

ALTER TABLE devolucoes ADD CONSTRAINT chk_motivo_devolucao CHECK (
    motivo_devolucao IN (
        'PRODUTO_DEFEITUOSO',
        'PRODUTO_DIFERENTE',
        'ARREPENDIMENTO',
        'PRODUTO_DANIFICADO',
        'ENTREGA_ATRASADA',
        'NAO_ATENDE_EXPECTATIVA',
        'OUTRO',
        'ERRO_MEDIDA_CLIENTE'
    )
);

-- Mensagem informativa (não falha a migração)
DO $$ BEGIN RAISE NOTICE 'V17: Alterações de devoluções e lojista_erp_config aplicadas.'; END $$;
