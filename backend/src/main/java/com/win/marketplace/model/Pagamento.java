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
@Table(name = "pagamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private Pedido pedido;

    @Column(name = "metodo_pagamento", length = 50, nullable = false)
    private String metodoPagamento; // VARCHAR, não enum

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(name = "parcelas")
    private Integer parcelas;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @Column(name = "transacao_id", length = 100)
    private String transacaoId;

    @Column(name = "informacoes_cartao", length = 100)
    private String informacoesCartao;

    @Column(name = "observacoes", length = 200)
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    public enum StatusPagamento {
        PENDENTE, PROCESSANDO, APROVADO, RECUSADO, CANCELADO, ESTORNADO
    }
}