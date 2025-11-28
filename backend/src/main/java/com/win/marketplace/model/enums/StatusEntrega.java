package com.win.marketplace.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enum para os status possíveis de uma entrega via Uber Flash.
 * 
 * Fluxo normal:
 * AGUARDANDO_PREPARACAO → AGUARDANDO_MOTORISTA → MOTORISTA_A_CAMINHO_RETIRADA → 
 * EM_TRANSITO → ENTREGUE
 * 
 * Fluxos de exceção:
 * - CANCELADA: Entrega cancelada em qualquer etapa
 * - FALHA_SOLICITACAO: Falha ao solicitar corrida à Uber
 */
@Getter
@RequiredArgsConstructor
public enum StatusEntrega {
    
    AGUARDANDO_PREPARACAO("Aguardando Preparação", "Pedido criado, aguardando lojista preparar"),
    AGUARDANDO_MOTORISTA("Aguardando Motorista", "Pedido pronto, aguardando motorista aceitar"),
    MOTORISTA_A_CAMINHO_RETIRADA("Motorista a Caminho", "Motorista a caminho do lojista para retirada"),
    EM_TRANSITO("Em Trânsito", "Motorista retirou e está indo ao cliente"),
    ENTREGUE("Entregue", "Pedido entregue ao cliente"),
    CANCELADA("Cancelada", "Entrega cancelada"),
    FALHA_SOLICITACAO("Falha na Solicitação", "Falha ao solicitar corrida à Uber");
    
    private final String descricao;
    private final String detalhes;
    
    /**
     * Verifica se o status é um status final (não pode mais ser alterado).
     */
    public boolean isFinal() {
        return this == ENTREGUE || this == CANCELADA;
    }
    
    /**
     * Verifica se o status indica que a corrida está em andamento.
     */
    public boolean isEmAndamento() {
        return this == MOTORISTA_A_CAMINHO_RETIRADA || this == EM_TRANSITO;
    }
}
