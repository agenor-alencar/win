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
@Table(name = "promocoes")
public class Promocao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_desconto", length = 20, nullable = false)
    private TipoDesconto tipoDesconto;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(name = "data_inicio", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime dataInicio;

    @Column(name = "data_fim", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime dataFim;

    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id")
    private Lojista lojista;

    public enum TipoDesconto {
        PERCENTUAL, VALOR_FIXO
    }
}