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

@Entity
@Table(name = "cupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String codigo;

    @Column(length = 200)
    private String descricao;

    @Column(name = "tipo_desconto", length = 20, nullable = false)
    private String tipoDesconto; // PERCENTUAL ou VALOR_FIXO

    @Column(name = "valor_desconto", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorDesconto;

    @Column(name = "valor_minimo_pedido", precision = 10, scale = 2)
    private BigDecimal valorMinimoPedido;

    @Column(name = "data_inicio", nullable = false)
    private OffsetDateTime dataInicio;

    @Column(name = "data_fim", nullable = false)
    private OffsetDateTime dataFim;

    @Column(name = "limite_uso")
    private Integer limiteUso;

    @Column(name = "vezes_usado", nullable = false)
    private Integer vezesUsado = 0;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;
}