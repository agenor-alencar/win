package com.win.marketplace.model.enums;

/**
 * Tipos de validação de PIN code.
 * 
 * COLETA: PIN enviado ao motorista para confirmar a coleta da encomenda
 * ENTREGA: PIN enviado ao cliente para confirmar o recebimento da encomenda
 */
public enum TipoPinValidacao {
    COLETA("Coleta na loja/residência"),
    ENTREGA("Entrega ao cliente final");

    private final String descricao;

    TipoPinValidacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
