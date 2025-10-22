package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "numero_pedido", length = 20, unique = true, nullable = false)
    private String numeroPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id")
    private Motorista motorista;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private StatusPedido status = StatusPedido.PENDENTE;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal frete = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal total;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "endereco_entrega", nullable = false, columnDefinition = "jsonb")
    private Endereco enderecoEntrega;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pagamento", columnDefinition = "jsonb")
    private Pagamento pagamento;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "nota_fiscal", columnDefinition = "jsonb")
    private NotaFiscal notaFiscal;

    @Column(name = "codigo_entrega", length = 10)
    private String codigoEntrega;

    @Column(name = "peso_total_kg", precision = 10, scale = 3)
    private BigDecimal pesoTotalKg;

    @Column(name = "volume_total_m3", precision = 10, scale = 4)
    private BigDecimal volumeTotalM3;

    @Column(name = "maior_dimensao_cm", precision = 10, scale = 2)
    private BigDecimal maiorDimensaoCm;

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "confirmado_em", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime confirmadoEm;

    @Column(name = "entregue_em", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime entregueEm;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoCupom> cuponsAplicados;

    public enum StatusPedido {
        PENDENTE, CONFIRMADO, PREPARANDO, PRONTO, EM_TRANSITO, ENTREGUE, CANCELADO
    }
}