package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade que representa uma transação de pagamento associada a um pedido.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", nullable = false)
    private MetodoPagamento metodoPagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(name = "id_transacao")
    private String idTransacao; // ID retornado pelo gateway de pagamento

    @Column(name = "resposta_gateway", columnDefinition = "JSONB")
    private String respostaGateway; // Para armazenar o JSON completo da resposta do gateway

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    public enum MetodoPagamento {
        PIX
        //CARTAO_CREDITO,
        //BOLETO  (para quando a gateway estiver recebendo esses outros métodos de pagamentos )
    }

    public enum StatusPagamento {
        PENDENTE,
        APROVADO,
        RECUSADO,
        ESTORNADO
    }
}