package com.win.marketplace.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class UsuarioPerfilId implements Serializable {
    private UUID usuarioId;
    private UUID perfilId;
}
