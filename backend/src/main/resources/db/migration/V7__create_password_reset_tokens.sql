-- Tabela para armazenar tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    usado_em TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_password_reset_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_usuario_id ON password_reset_tokens(usuario_id);
CREATE INDEX idx_password_reset_expira_em ON password_reset_tokens(expira_em);
CREATE INDEX idx_password_reset_usado ON password_reset_tokens(usado);

-- Comentários
COMMENT ON TABLE password_reset_tokens IS 'Tokens para reset de senha de usuários';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único gerado para reset de senha';
COMMENT ON COLUMN password_reset_tokens.expira_em IS 'Data e hora de expiração do token (normalmente 1 hora após criação)';
COMMENT ON COLUMN password_reset_tokens.usado IS 'Indica se o token já foi utilizado';
