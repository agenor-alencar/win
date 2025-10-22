package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"usuario", "perfil"})
@ToString(exclude = {"usuario", "perfil"})
@Entity
@Table(name = "usuario_perfis")
public class UsuarioPerfil {

    @EmbeddedId
    private UsuarioPerfilId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("perfilId")
    @JoinColumn(name = "perfil_id")
    private Perfil perfil;

    @Column(name = "data_atribuicao", nullable = false, updatable = false)
    private OffsetDateTime dataAtribuicao; // ✅ ADICIONAR ESTE CAMPO

    @PrePersist
    protected void onCreate() {
        if (dataAtribuicao == null) {
            dataAtribuicao = OffsetDateTime.now();
        }
    }
}