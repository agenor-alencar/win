CREATE TABLE IF NOT EXISTS pedido_status_historico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    status_anterior VARCHAR(30) NOT NULL,
    status_novo VARCHAR(30) NOT NULL,
    observacao VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedido_status_historico_pedido
    ON pedido_status_historico (pedido_id);

CREATE INDEX IF NOT EXISTS idx_pedido_status_historico_criado_em
    ON pedido_status_historico (criado_em DESC);
