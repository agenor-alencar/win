package com.win.marketplace.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCupomId implements Serializable {
    private UUID pedido;
    private UUID cupom;
}