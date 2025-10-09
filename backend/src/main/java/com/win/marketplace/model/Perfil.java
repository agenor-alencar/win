package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "perfis")
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TipoPerfil tipo;

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private StatusPerfil status;

    public enum TipoPerfil {
        ADMIN, CLIENTE, LOJISTA, ENTREGADOR
    }

    public enum StatusPerfil {
        ATIVO, INATIVO
    }
}
