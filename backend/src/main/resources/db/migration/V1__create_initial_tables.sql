-- =====================================================================
-- BANCO DE DADOS WIN MARKETPLACE - V1 CORRIGIDO E COMPLETO
-- =====================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ====================================
-- 1. SISTEMA DE USUÁRIOS E PERFIS
-- ====================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ultimo_login TIMESTAMP WITH TIME ZONE
);

CREATE TABLE perfis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao) VALUES
('ADMIN', 'Administrador do sistema com acesso total'),
('CLIENTE', 'Cliente que pode fazer compras na plataforma'),
('LOJISTA', 'Lojista que pode vender produtos'),
('MOTORISTA', 'Motorista que pode fazer entregas');

CREATE TABLE usuarios_perfis (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    perfil_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, perfil_id),
    data_atribuicao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
);

CREATE TABLE lojistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    nome_fantasia VARCHAR(200) NOT NULL,
    razao_social VARCHAR(200) NOT NULL,
    descricao TEXT,
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tipos_veiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    peso_max_kg DECIMAL(8,2) NOT NULL,
    volume_max_m3 DECIMAL(8,4) NOT NULL,
    dimensao_max_cm DECIMAL(8,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO tipos_veiculos (nome, descricao, peso_max_kg, volume_max_m3, dimensao_max_cm) VALUES
('BICICLETA', 'Para entregas ultraleves e curtas', 5.00, 0.0200, 40.00),
('MOTO', 'Para entregas rápidas de pequeno e médio porte', 20.00, 0.1200, 60.00),
('CARRO', 'Para entregas de grande porte ou múltiplos pedidos', 200.00, 1.5000, 200.00);

CREATE TABLE motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    cnh VARCHAR(15) UNIQUE NOT NULL,
    categoria_cnh VARCHAR(5) NOT NULL,
    tipo_veiculo_id UUID NOT NULL REFERENCES tipos_veiculos(id),
    placa_veiculo VARCHAR(10),
    disponivel BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    avaliacao DECIMAL(3,2) DEFAULT 0,
    quantidade_avaliacoes INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    apelido VARCHAR(100),
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ====================================
-- 2. SISTEMA DE PRODUTOS E CATÁLOGO
-- ====================================

CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria_pai_id UUID REFERENCES categorias(id),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lojista_id UUID NOT NULL REFERENCES lojistas(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES categorias(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 0,
    peso_kg DECIMAL(8,3),
    comprimento_cm DECIMAL(8,2),
    largura_cm DECIMAL(8,2),
    altura_cm DECIMAL(8,2),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    avaliacao DECIMAL(3,2) DEFAULT 0,
    quantidade_avaliacoes INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE imagem_produto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    texto_alternativo VARCHAR(200),
    ordem_exibicao INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ====================================
-- 3. SISTEMA DE PROMOÇÕES E CUPONS
-- ====================================

CREATE TABLE cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(200),
    tipo_desconto VARCHAR(20) NOT NULL CHECK (tipo_desconto IN ('PERCENTUAL', 'VALOR_FIXO')),
    valor_desconto DECIMAL(10,2) NOT NULL,
    valor_minimo_pedido DECIMAL(10,2),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    limite_uso INTEGER,
    vezes_usado INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ====================================
-- 4. SISTEMA DE PEDIDOS
-- ====================================

CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    cupom_id UUID REFERENCES cupons(id),
    endereco_entrega_id UUID REFERENCES enderecos(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN (
        'PENDENTE','CONFIRMADO','PREPARANDO','PRONTO',
        'EM_TRANSITO','ENTREGUE','CANCELADO'
    )),
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    frete DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    confirmado_em TIMESTAMP WITH TIME ZONE,
    entregue_em TIMESTAMP WITH TIME ZONE,
    cancelado_em TIMESTAMP WITH TIME ZONE
);

CREATE TABLE itens_pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    lojista_id UUID NOT NULL REFERENCES lojistas(id),
    nome_produto VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- ====================================
-- 5. SISTEMA DE ENTREGAS
-- ====================================

CREATE TABLE entregas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    motorista_id UUID REFERENCES motoristas(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN (
        'PENDENTE','ATRIBUIDA','EM_COLETA','EM_TRANSITO',
        'ENTREGUE','CANCELADA','FALHOU'
    )),
    taxa_entrega DECIMAL(8,2) NOT NULL,
    distancia_km DECIMAL(8,2),
    tempo_estimado_minutos INTEGER,
    codigo_rastreio VARCHAR(50),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atribuida_em TIMESTAMP WITH TIME ZONE,
    coletada_em TIMESTAMP WITH TIME ZONE,
    entregue_em TIMESTAMP WITH TIME ZONE,
    cancelada_em TIMESTAMP WITH TIME ZONE
);

-- ====================================
-- 6. SISTEMA DE PAGAMENTOS
-- ====================================

CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo_pagamento VARCHAR(20) NOT NULL CHECK (metodo_pagamento IN (
        'PIX','CARTAO_CREDITO','CARTAO_DEBITO','BOLETO','DINHEIRO'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN (
        'PENDENTE','PROCESSANDO','APROVADO','RECUSADO','ESTORNADO','CANCELADO'
    )),
    valor DECIMAL(10,2) NOT NULL,
    id_transacao_externa VARCHAR(100),
    dados_pagamento JSONB,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    recusado_em TIMESTAMP WITH TIME ZONE
);

-- ====================================
-- 7. SISTEMA DE AVALIAÇÕES
-- ====================================

-- Avaliações de PRODUTOS
CREATE TABLE avaliacoes_produto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    pedido_id UUID REFERENCES pedidos(id),
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    imagens_urls TEXT[],
    verificada BOOLEAN DEFAULT FALSE,
    resposta_lojista TEXT,
    respondida_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(produto_id, usuario_id, pedido_id)
);

-- Avaliações de ENTREGAS (motoristas)
CREATE TABLE avaliacoes_entrega (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entrega_id UUID NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    motorista_id UUID NOT NULL REFERENCES motoristas(id),
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    pontualidade INTEGER CHECK (pontualidade >= 1 AND pontualidade <= 5),
    cordialidade INTEGER CHECK (cordialidade >= 1 AND cordialidade <= 5),
    estado_produto INTEGER CHECK (estado_produto >= 1 AND estado_produto <= 5),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(entrega_id, usuario_id)
);

-- ====================================
-- 8. SISTEMA DE NOTIFICAÇÕES
-- ====================================

CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN (
        'PEDIDO','ENTREGA','PAGAMENTO','PROMOCAO','SISTEMA','AVALIACAO'
    )),
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    dados_adicionais JSONB,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ====================================
-- 9. ÍNDICES PARA PERFORMANCE
-- ====================================

-- Usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Perfis e relacionamentos
CREATE INDEX idx_usuarios_perfis_usuario_id ON usuarios_perfis(usuario_id);
CREATE INDEX idx_usuarios_perfis_perfil_id ON usuarios_perfis(perfil_id);

-- Lojistas
CREATE INDEX idx_lojistas_usuario_id ON lojistas(usuario_id);
CREATE INDEX idx_lojistas_cnpj ON lojistas(cnpj);
CREATE INDEX idx_lojistas_ativo ON lojistas(ativo);

-- Motoristas
CREATE INDEX idx_motoristas_usuario_id ON motoristas(usuario_id);
CREATE INDEX idx_motoristas_cnh ON motoristas(cnh);
CREATE INDEX idx_motoristas_disponivel ON motoristas(disponivel);

-- Endereços
CREATE INDEX idx_enderecos_usuario_id ON enderecos(usuario_id);
CREATE INDEX idx_enderecos_principal ON enderecos(principal, ativo);

-- Categorias
CREATE INDEX idx_categorias_nome ON categorias(nome);
CREATE INDEX idx_categorias_pai_id ON categorias(categoria_pai_id);

-- Produtos
CREATE INDEX idx_produtos_lojista_id ON produtos(lojista_id);
CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- Imagens de produtos
CREATE INDEX idx_imagem_produto_produto_id ON imagem_produto(produto_id);
CREATE INDEX idx_imagem_produto_ordem ON imagem_produto(produto_id, ordem_exibicao);

-- Cupons
CREATE INDEX idx_cupons_codigo ON cupons(codigo);
CREATE INDEX idx_cupons_ativo ON cupons(ativo);
CREATE INDEX idx_cupons_vigencia ON cupons(data_inicio, data_fim);

-- Pedidos
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_criado_em ON pedidos(criado_em DESC);
CREATE INDEX idx_pedidos_cupom_id ON pedidos(cupom_id);

-- Itens de pedido
CREATE INDEX idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto_id ON itens_pedido(produto_id);
CREATE INDEX idx_itens_pedido_lojista_id ON itens_pedido(lojista_id);

-- Entregas
CREATE INDEX idx_entregas_pedido_id ON entregas(pedido_id);
CREATE INDEX idx_entregas_motorista_id ON entregas(motorista_id);
CREATE INDEX idx_entregas_status ON entregas(status);
CREATE INDEX idx_entregas_codigo_rastreio ON entregas(codigo_rastreio);

-- Pagamentos
CREATE INDEX idx_pagamentos_pedido_id ON pagamentos(pedido_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_id_transacao ON pagamentos(id_transacao_externa);

-- Avaliações
CREATE INDEX idx_avaliacoes_produto_produto_id ON avaliacoes_produto(produto_id);
CREATE INDEX idx_avaliacoes_produto_usuario_id ON avaliacoes_produto(usuario_id);
CREATE INDEX idx_avaliacoes_produto_nota ON avaliacoes_produto(nota);
CREATE INDEX idx_avaliacoes_produto_criado_em ON avaliacoes_produto(criado_em DESC);

CREATE INDEX idx_avaliacoes_entrega_entrega_id ON avaliacoes_entrega(entrega_id);
CREATE INDEX idx_avaliacoes_entrega_motorista_id ON avaliacoes_entrega(motorista_id);
CREATE INDEX idx_avaliacoes_entrega_nota ON avaliacoes_entrega(nota);

-- Notificações
CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_criado_em ON notificacoes(criado_em DESC);

-- ====================================
-- 10. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ====================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com atualizado_em
CREATE TRIGGER trigger_atualizar_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_perfis
    BEFORE UPDATE ON perfis
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_lojistas
    BEFORE UPDATE ON lojistas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_motoristas
    BEFORE UPDATE ON motoristas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_tipos_veiculos
    BEFORE UPDATE ON tipos_veiculos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_enderecos
    BEFORE UPDATE ON enderecos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_categorias
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_produtos
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_cupons
    BEFORE UPDATE ON cupons
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_pedidos
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_entregas
    BEFORE UPDATE ON entregas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_pagamentos
    BEFORE UPDATE ON pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_atualizar_avaliacoes_produto
    BEFORE UPDATE ON avaliacoes_produto
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- ====================================
-- 11. TRIGGERS PARA ATUALIZAR AVALIAÇÕES
-- ====================================

-- Trigger para atualizar média do produto
CREATE OR REPLACE FUNCTION atualizar_avaliacao_produto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE produtos
    SET 
        avaliacao = (
            SELECT ROUND(AVG(nota)::numeric, 2)
            FROM avaliacoes_produto
            WHERE produto_id = NEW.produto_id
        ),
        quantidade_avaliacoes = (
            SELECT COUNT(*)
            FROM avaliacoes_produto
            WHERE produto_id = NEW.produto_id
        )
    WHERE id = NEW.produto_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_avaliacao_produto
AFTER INSERT OR UPDATE ON avaliacoes_produto
FOR EACH ROW
EXECUTE FUNCTION atualizar_avaliacao_produto();

-- Trigger para atualizar média do motorista
CREATE OR REPLACE FUNCTION atualizar_avaliacao_motorista()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE motoristas
    SET 
        avaliacao = (
            SELECT ROUND(AVG(nota)::numeric, 2)
            FROM avaliacoes_entrega
            WHERE motorista_id = NEW.motorista_id
        ),
        quantidade_avaliacoes = (
            SELECT COUNT(*)
            FROM avaliacoes_entrega
            WHERE motorista_id = NEW.motorista_id
        )
    WHERE id = NEW.motorista_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_avaliacao_motorista
AFTER INSERT OR UPDATE ON avaliacoes_entrega
FOR EACH ROW
EXECUTE FUNCTION atualizar_avaliacao_motorista();

-- ====================================
-- FIM DO SCRIPT
-- ====================================