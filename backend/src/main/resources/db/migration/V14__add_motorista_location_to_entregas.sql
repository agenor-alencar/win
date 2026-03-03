-- ====================================
-- V14: Adicionar colunas para integração Uber Direct
-- ====================================
-- Descrição: Adiciona todas as colunas necessárias para integração
-- completa com Uber Direct API (entregas, rastreamento, webhooks)

ALTER TABLE entregas
-- Tipo de Veículo e Valores
ADD COLUMN IF NOT EXISTS tipo_veiculo_solicitado VARCHAR(50),
ADD COLUMN IF NOT EXISTS valor_corrida_uber DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_frete_cliente DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS taxa_winmarket DECIMAL(10,2),

-- Status Entrega (Uber Direct)
ADD COLUMN IF NOT EXISTS status_entrega VARCHAR(50),

-- Dados do Motorista
ADD COLUMN IF NOT EXISTS nome_motorista VARCHAR(255),
ADD COLUMN IF NOT EXISTS placa_veiculo VARCHAR(20),
ADD COLUMN IF NOT EXISTS contato_motorista VARCHAR(20),
ADD COLUMN IF NOT EXISTS latitude_motorista DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude_motorista DOUBLE PRECISION,

-- IDs e Códigos Uber
ADD COLUMN IF NOT EXISTS id_corrida_uber VARCHAR(255),
ADD COLUMN IF NOT EXISTS codigo_retirada_uber VARCHAR(50),
ADD COLUMN IF NOT EXISTS codigo_entrega_uber VARCHAR(50),
ADD COLUMN IF NOT EXISTS url_rastreamento_uber VARCHAR(500),

-- Quote ID e Valores
ADD COLUMN IF NOT EXISTS quote_id_uber VARCHAR(255),
ADD COLUMN IF NOT EXISTS valor_original_cotado DECIMAL(10,2),

-- Timestamps Detalhados
ADD COLUMN IF NOT EXISTS criada_uber_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aceita_motorista_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS a_caminho_coleta_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chegou_lojista_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS coletou_pedido_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS a_caminho_entrega_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chegou_destino_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS finalizada_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelada_uber_em TIMESTAMP WITH TIME ZONE,

-- Motivo Cancelamento
ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,

-- Controle API
ADD COLUMN IF NOT EXISTS ultima_sincronizacao_uber TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS webhook_recebido_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resposta_completa_uber JSONB;

-- Comentários explicativos
COMMENT ON COLUMN entregas.tipo_veiculo_solicitado IS 'Tipo de veículo solicitado (AUTO, MOTORBIKE, etc)';
COMMENT ON COLUMN entregas.valor_corrida_uber IS 'Valor bruto cobrado pela Uber Direct';
COMMENT ON COLUMN entregas.valor_frete_cliente IS 'Valor total cobrado do cliente (com taxa 10%)';
COMMENT ON COLUMN entregas.taxa_winmarket IS 'Margem de lucro do Win Marketplace (10%)';
COMMENT ON COLUMN entregas.status_entrega IS 'Status detalhado da entrega Uber Direct';
COMMENT ON COLUMN entregas.latitude_motorista IS 'Latitude da localização em tempo real do motorista';
COMMENT ON COLUMN entregas.longitude_motorista IS 'Longitude da localização em tempo real do motorista';
COMMENT ON COLUMN entregas.id_corrida_uber IS 'ID único da corrida retornado pela Uber Direct';
COMMENT ON COLUMN entregas.quote_id_uber IS 'ID da cotação para garantir preço';
COMMENT ON COLUMN entregas.url_rastreamento_uber IS 'Link de rastreamento em tempo real';
COMMENT ON COLUMN entregas.resposta_completa_uber IS 'Payload completo da última resposta da API Uber';
