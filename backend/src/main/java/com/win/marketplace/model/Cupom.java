package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cupons")
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(length = 50, unique = true, nullable = false)
    private String codigo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_desconto", length = 20, nullable = false)
    private TipoDesconto tipoDesconto;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(name = "data_validade", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime dataValidade;

    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "usos_atuais", nullable = false)
    private Integer usosAtuais = 0;

    @Column(name = "valor_minimo_pedido", precision = 10, scale = 2)
    private BigDecimal valorMinimoPedido;

    @Column(nullable = false)
    private Boolean ativo = true;

    public enum TipoDesconto {
        PERCENTUAL, VALOR_FIXO
    }
}