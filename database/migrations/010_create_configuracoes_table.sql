-- Migration: Criar tabela de configurações do sistema
-- Objetivo: Armazenar configurações globais do marketplace

CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Modelo Financeiro
    taxa_comissao_win DECIMAL(5,2) NOT NULL DEFAULT 7.00,
    taxa_repasse_lojista DECIMAL(5,2) NOT NULL DEFAULT 93.00,
    valor_entrega_motorista DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    taxa_processamento_pagamento DECIMAL(5,2) NOT NULL DEFAULT 0.20,
    dias_repasse INTEGER NOT NULL DEFAULT 2,
    
    -- Configurações Gerais
    taxa_entrega_padrao DECIMAL(10,2) NOT NULL DEFAULT 8.50,
    frete_gratis_acima_de DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    limite_aprovacao_automatica DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    distancia_maxima_entrega_km INTEGER NOT NULL DEFAULT 15,
    timeout_pedido_minutos INTEGER NOT NULL DEFAULT 30,
    
    -- Entregas
    taxa_entrega_por_km DECIMAL(10,2) NOT NULL DEFAULT 1.20,
    tempo_maximo_entrega_minutos INTEGER NOT NULL DEFAULT 60,
    auto_atribuir_entrega BOOLEAN NOT NULL DEFAULT true,
    permitir_agendamento BOOLEAN NOT NULL DEFAULT true,
    horario_inicio VARCHAR(5) NOT NULL DEFAULT '08:00',
    horario_fim VARCHAR(5) NOT NULL DEFAULT '22:00',
    
    -- Notificações
    email_notificacoes BOOLEAN NOT NULL DEFAULT true,
    sms_notificacoes BOOLEAN NOT NULL DEFAULT false,
    push_notificacoes BOOLEAN NOT NULL DEFAULT true,
    confirmar_pedido BOOLEAN NOT NULL DEFAULT true,
    atualizar_status BOOLEAN NOT NULL DEFAULT true,
    emails_promocionais BOOLEAN NOT NULL DEFAULT false,
    relatorios_semanais BOOLEAN NOT NULL DEFAULT true,
    
    -- Segurança
    autenticacao_dois_fatores BOOLEAN NOT NULL DEFAULT false,
    timeout_sessao_minutos INTEGER NOT NULL DEFAULT 120,
    max_tentativas_login INTEGER NOT NULL DEFAULT 5,
    forca_senha VARCHAR(20) NOT NULL DEFAULT 'medium',
    auditoria_ativa BOOLEAN NOT NULL DEFAULT true,
    
    -- Legal
    versao_termos VARCHAR(10) NOT NULL DEFAULT '1.2',
    versao_privacidade VARCHAR(10) NOT NULL DEFAULT '1.1',
    politica_cookies BOOLEAN NOT NULL DEFAULT true,
    conformidade_lgpd BOOLEAN NOT NULL DEFAULT true,
    retencao_dados_anos INTEGER NOT NULL DEFAULT 5,
    email_contato VARCHAR(255) NOT NULL DEFAULT 'suporte@winmarketplace.com',
    
    -- Auditoria
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE,
    atualizado_por VARCHAR(255),
    
    CONSTRAINT chk_comissao_repasse CHECK (taxa_comissao_win + taxa_repasse_lojista = 100.00),
    CONSTRAINT chk_horario_valido CHECK (horario_inicio < horario_fim)
);

-- Criar índice para buscar config ativa
CREATE INDEX IF NOT EXISTS idx_configuracoes_ativa ON configuracoes(ativo, criado_em DESC) WHERE ativo = true;

-- Inserir configuração padrão
INSERT INTO configuracoes (
    taxa_comissao_win,
    taxa_repasse_lojista,
    valor_entrega_motorista,
    taxa_processamento_pagamento,
    dias_repasse,
    ativo,
    atualizado_por
) VALUES (
    7.00,
    93.00,
    15.00,
    0.20,
    2,
    true,
    'system'
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE configuracoes IS 'Configurações globais do sistema Win Marketplace';
COMMENT ON COLUMN configuracoes.taxa_comissao_win IS 'Percentual de comissão cobrado pela plataforma (padrão 7%)';
COMMENT ON COLUMN configuracoes.taxa_repasse_lojista IS 'Percentual repassado ao lojista (padrão 93%)';
COMMENT ON COLUMN configuracoes.valor_entrega_motorista IS 'Valor médio pago por entrega ao motorista';
COMMENT ON COLUMN configuracoes.dias_repasse IS 'Dias úteis para repasse ao lojista (D+N)';
