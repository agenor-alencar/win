package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pedidos_cupons")
@IdClass(PedidoCupomId.class)
public class PedidoCupom {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cupom_id", nullable = false)
    private Cupom cupom;

    @Column(name = "valor_descontado", precision = 10, scale = 2, nullable = false)
    private BigDecimal valorDescontado;
}