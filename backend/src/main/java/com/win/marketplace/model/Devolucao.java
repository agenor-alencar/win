package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade que representa uma solicitação de devolução/reembolso
 */
@Entity
@Table(name = "devolucoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Devolucao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "numero_devolucao", unique = true, nullable = false, length = 20)
    private String numeroDevolucao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_pedido_id", nullable = false)
    private ItemPedido itemPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id", nullable = false)
    private Lojista lojista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MotivoDevolucao motivoDevolucao;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "quantidade_devolvida", nullable = false)
    private Integer quantidadeDevolvida;

    @Column(name = "valor_devolucao", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDevolucao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusDevolucao status = StatusDevolucao.PENDENTE;

    @Column(name = "justificativa_lojista", columnDefinition = "TEXT")
    private String justificativaLojista;

    @Column(name = "data_aprovacao")
    private OffsetDateTime dataAprovacao;

    @Column(name = "data_recusa")
    private OffsetDateTime dataRecusa;

    @Column(name = "data_reembolso")
    private OffsetDateTime dataReembolso;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;

    /**
     * Enum para os motivos de devolução
     */
    public enum MotivoDevolucao {
        PRODUTO_DEFEITUOSO("Produto com defeito"),
        PRODUTO_DIFERENTE("Produto diferente do anunciado"),
        ARREPENDIMENTO("Arrependimento da compra"),
        PRODUTO_DANIFICADO("Produto danificado no transporte"),
        ENTREGA_ATRASADA("Entrega muito atrasada"),
        NAO_ATENDE_EXPECTATIVA("Não atende às expectativas"),
        OUTRO("Outro motivo");

        private final String descricao;

        MotivoDevolucao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    /**
     * Enum para os status da devolução
     */
    public enum StatusDevolucao {
        PENDENTE("Aguardando análise do lojista"),
        APROVADO("Devolução aprovada"),
        RECUSADO("Devolução recusada"),
        EM_TRANSITO("Produto em trânsito para o lojista"),
        RECEBIDO("Produto recebido pelo lojista"),
        REEMBOLSADO("Reembolso efetuado"),
        CANCELADO("Devolução cancelada");

        private final String descricao;

        StatusDevolucao(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }
}
