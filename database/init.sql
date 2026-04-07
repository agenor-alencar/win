-- ============================================
-- WIN MARKETPLACE - SCHEMA COMPLETO
-- ============================================
-- Versão: 1.0
-- Data: 24/10/2025
-- Descrição: Schema completo do banco de dados
-- ============================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configurações
SET timezone = 'America/Sao_Paulo';
COMMENT ON DATABASE win_marketplace IS 'Banco de dados do Win Marketplace';
GRANT ALL PRIVILEGES ON DATABASE win_marketplace TO postgres;

-- ============================================
-- TABELA: perfis
-- ============================================
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(500),
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfis_nome ON perfis(nome);
CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(ativo);

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT true,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- ============================================
-- TABELA: usuario_perfis (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS usuario_perfis (
    usuario_id UUID NOT NULL,
    perfil_id UUID NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, perfil_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_perfis_usuario ON usuario_perfis(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_perfil ON usuario_perfis(perfil_id);

-- ============================================
-- TABELA: lojistas
-- ============================================
CREATE TABLE IF NOT EXISTS lojistas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE,
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    inscricao_estadual VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    site VARCHAR(255),
    descricao TEXT,
    logo_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
    status_aprovacao VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    comissao DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lojistas_cnpj ON lojistas(cnpj);
CREATE INDEX IF NOT EXISTS idx_lojistas_status ON lojistas(status);
CREATE INDEX IF NOT EXISTS idx_lojistas_usuario ON lojistas(usuario_id);

-- ============================================
-- TABELA: motoristas
-- ============================================
CREATE TABLE IF NOT EXISTS motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE,
    cnh VARCHAR(20) NOT NULL UNIQUE,
    categoria_cnh VARCHAR(5) NOT NULL,
    veiculo_placa VARCHAR(10),
    veiculo_modelo VARCHAR(100),
    veiculo_ano INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'DISPONIVEL',
    avaliacao_media DECIMAL(3,2),
    total_entregas INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_motoristas_cnh ON motoristas(cnh);
CREATE INDEX IF NOT EXISTS idx_motoristas_status ON motoristas(status);
CREATE INDEX IF NOT EXISTS idx_motoristas_usuario ON motoristas(usuario_id);

-- ============================================
-- TABELA: administrador
-- ============================================
CREATE TABLE IF NOT EXISTS administrador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE,
    nivel_acesso VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    departamento VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_administrador_usuario ON administrador(usuario_id);

-- ============================================
-- TABELA: enderecos
-- ============================================
CREATE TABLE IF NOT EXISTS enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    nome VARCHAR(100),
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    pais VARCHAR(50) DEFAULT 'Brasil',
    principal BOOLEAN DEFAULT false,
    tipo VARCHAR(50) DEFAULT 'RESIDENCIAL',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enderecos_usuario ON enderecos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_cep ON enderecos(cep);

-- ============================================
-- TABELA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    slug VARCHAR(100) UNIQUE,
    categoria_pai_id UUID,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER DEFAULT 0,
    imagem_url VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categorias_slug ON categorias(slug);
CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias(ativo);
CREATE INDEX IF NOT EXISTS idx_categorias_pai ON categorias(categoria_pai_id);

-- ============================================
-- TABELA: produtos
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lojista_id UUID NOT NULL,
    categoria_id UUID,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    slug VARCHAR(255) UNIQUE,
    preco DECIMAL(10,2) NOT NULL,
    preco_promocional DECIMAL(10,2),
    estoque INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    peso DECIMAL(10,3),
    largura DECIMAL(10,2),
    altura DECIMAL(10,2),
    profundidade DECIMAL(10,2),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    ean VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
    status_aprovacao VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    destaque BOOLEAN DEFAULT false,
    visualizacoes INTEGER DEFAULT 0,
    vendas INTEGER DEFAULT 0,
    avaliacao_media DECIMAL(3,2),
    total_avaliacoes INTEGER DEFAULT 0,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (lojista_id) REFERENCES lojistas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_produtos_lojista ON produtos(lojista_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);
CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
CREATE INDEX IF NOT EXISTS idx_produtos_preco ON produtos(preco);

-- ============================================
-- TABELA: imagem_produto
-- ============================================
CREATE TABLE IF NOT EXISTS imagem_produto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL,
    url VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255),
    principal BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_imagem_produto_produto ON imagem_produto(produto_id);

-- ============================================
-- TABELA: variacao_produto
-- ============================================
CREATE TABLE IF NOT EXISTS variacao_produto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    valor VARCHAR(100) NOT NULL,
    preco_adicional DECIMAL(10,2) DEFAULT 0,
    estoque INTEGER DEFAULT 0,
    sku VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_variacao_produto ON variacao_produto(produto_id);

-- ============================================
-- TABELA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL,
    lojista_id UUID,
    endereco_entrega_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    status_pagamento VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    valor_produtos DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_frete DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    forma_pagamento VARCHAR(50),
    observacoes TEXT,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_envio TIMESTAMP WITH TIME ZONE,
    data_entrega TIMESTAMP WITH TIME ZONE,
    data_cancelamento TIMESTAMP WITH TIME ZONE,
    motivo_cancelamento TEXT,
    codigo_rastreio VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (lojista_id) REFERENCES lojistas(id) ON DELETE SET NULL,
    FOREIGN KEY (endereco_entrega_id) REFERENCES enderecos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_lojista ON pedidos(lojista_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_criado ON pedidos(criado_em);

-- ============================================
-- TABELA: itens_pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS itens_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    nome_produto VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_itens_pedidos_pedido ON itens_pedidos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedidos_produto ON itens_pedidos(produto_id);

-- ============================================
-- TABELA: pagamentos
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    valor DECIMAL(10,2) NOT NULL,
    transacao_id VARCHAR(255),
    gateway VARCHAR(50),
    dados_pagamento JSONB,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_cancelamento TIMESTAMP WITH TIME ZONE,
    motivo_cancelamento TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido ON pagamentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_transacao ON pagamentos(transacao_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- ============================================
-- TABELA: cupons
-- ============================================
CREATE TABLE IF NOT EXISTS cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    valor_minimo DECIMAL(10,2),
    quantidade_total INTEGER,
    quantidade_usada INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cupons_codigo ON cupons(codigo);
CREATE INDEX IF NOT EXISTS idx_cupons_ativo ON cupons(ativo);

-- ============================================
-- TABELA: pedidos_cupons (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos_cupons (
    pedido_id UUID NOT NULL,
    cupom_id UUID NOT NULL,
    valor_desconto DECIMAL(10,2) NOT NULL,
    aplicado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (pedido_id, cupom_id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cupons_pedido ON pedidos_cupons(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cupons_cupom ON pedidos_cupons(cupom_id);

-- ============================================
-- TABELA: avaliacoes_produtos
-- ============================================
CREATE TABLE IF NOT EXISTS avaliacoes_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    pedido_id UUID,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    titulo VARCHAR(200),
    comentario TEXT,
    aprovado BOOLEAN DEFAULT false,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto ON avaliacoes_produtos(produto_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes_produtos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_aprovado ON avaliacoes_produtos(aprovado);

-- ============================================
-- TABELA: notificacoes
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    link VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_criado ON notificacoes(criado_em);

-- ============================================
-- TABELA: password_reset_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_usuario ON password_reset_tokens(usuario_id);

-- ============================================
-- TABELA: promocoes
-- ============================================
CREATE TABLE IF NOT EXISTS promocoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    produtos_ids UUID[],
    categorias_ids UUID[],
    ativo BOOLEAN DEFAULT true,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promocoes_ativo ON promocoes(ativo);
CREATE INDEX IF NOT EXISTS idx_promocoes_datas ON promocoes(data_inicio, data_fim);

-- ============================================
-- TABELA: notas_fiscais
-- ============================================
CREATE TABLE IF NOT EXISTS notas_fiscais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL,
    numero VARCHAR(50) NOT NULL UNIQUE,
    serie VARCHAR(10),
    chave_acesso VARCHAR(100) UNIQUE,
    xml_url VARCHAR(500),
    pdf_url VARCHAR(500),
    valor_total DECIMAL(10,2) NOT NULL,
    data_emissao TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notas_fiscais_pedido ON notas_fiscais(pedido_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_numero ON notas_fiscais(numero);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_chave ON notas_fiscais(chave_acesso);

-- ============================================
-- POPULAR DADOS INICIAIS
-- ============================================

-- Perfis padrão
INSERT INTO perfis (nome, descricao, ativo) VALUES
    ('USER', 'Usuário comum - pode comprar produtos', true),
    ('LOJISTA', 'Lojista - pode vender produtos', true),
    ('MOTORISTA', 'Motorista - entregas', true),
    ('ADMIN', 'Administrador - acesso total', true)
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- LOG FINAL
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'WIN MARKETPLACE - DATABASE INITIALIZED';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Timezone: America/Sao_Paulo';
    RAISE NOTICE 'Extensions: uuid-ossp, unaccent';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  - perfis (4 registros)';
    RAISE NOTICE '  - usuarios';
    RAISE NOTICE '  - usuario_perfis';
    RAISE NOTICE '  - lojistas';
    RAISE NOTICE '  - motoristas';
    RAISE NOTICE '  - administrador';
    RAISE NOTICE '  - enderecos';
    RAISE NOTICE '  - categorias';
    RAISE NOTICE '  - produtos';
    RAISE NOTICE '  - imagem_produto';
    RAISE NOTICE '  - variacao_produto';
    RAISE NOTICE '  - pedidos';
    RAISE NOTICE '  - itens_pedidos';
    RAISE NOTICE '  - pagamentos';
    RAISE NOTICE '  - cupons';
    RAISE NOTICE '  - pedidos_cupons';
    RAISE NOTICE '  - avaliacoes_produtos';
    RAISE NOTICE '  - notificacoes';
    RAISE NOTICE '  - password_reset_tokens';
    RAISE NOTICE '  - promocoes';
    RAISE NOTICE '  - notas_fiscais';
    RAISE NOTICE '  - devolucoes';
    RAISE NOTICE '';
    RAISE NOTICE 'Total: 22 tabelas + índices';
    RAISE NOTICE '==============================================';
END $$;

-- ============================================
-- TABELA: devolucoes
-- ============================================
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
    CONSTRAINT fk_devolucao_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucao_item_pedido FOREIGN KEY (item_pedido_id) REFERENCES itens_pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucao_lojista FOREIGN KEY (lojista_id) REFERENCES lojistas(id) ON DELETE CASCADE,
    CONSTRAINT chk_quantidade_devolvida CHECK (quantidade_devolvida > 0),
    CONSTRAINT chk_valor_devolucao CHECK (valor_devolucao > 0),
    CONSTRAINT chk_motivo_devolucao CHECK (motivo_devolucao IN ('PRODUTO_DEFEITUOSO', 'PRODUTO_DIFERENTE', 'ARREPENDIMENTO', 'PRODUTO_DANIFICADO', 'ENTREGA_ATRASADA', 'NAO_ATENDE_EXPECTATIVA', 'OUTRO')),
    CONSTRAINT chk_status_devolucao CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO', 'EM_TRANSITO', 'RECEBIDO', 'REEMBOLSADO', 'CANCELADO'))
);

CREATE INDEX IF NOT EXISTS idx_devolucoes_numero ON devolucoes(numero_devolucao);
CREATE INDEX IF NOT EXISTS idx_devolucoes_pedido ON devolucoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_usuario ON devolucoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_lojista ON devolucoes(lojista_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_status ON devolucoes(status);
CREATE INDEX IF NOT EXISTS idx_devolucoes_criado_em ON devolucoes(criado_em);
CREATE INDEX IF NOT EXISTS idx_devolucoes_lojista_status ON devolucoes(lojista_id, status);

-- ============================================
-- TABELA: otp_tokens (OTP via SMS)
-- ============================================
CREATE TABLE IF NOT EXISTS otp_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telefone VARCHAR(20) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    tentativas INTEGER NOT NULL DEFAULT 0,
    valido BOOLEAN NOT NULL DEFAULT true,
    expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_telefone ON otp_tokens(telefone);
CREATE INDEX IF NOT EXISTS idx_otp_valido ON otp_tokens(valido);
CREATE INDEX IF NOT EXISTS idx_otp_expiracao ON otp_tokens(expiracao);
CREATE INDEX IF NOT EXISTS idx_otp_telefone_valido ON otp_tokens(telefone, valido);