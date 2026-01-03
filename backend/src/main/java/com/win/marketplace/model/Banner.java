package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade que representa um banner da home page
 */
@Entity
@Table(name = "banners", indexes = {
    @Index(name = "idx_banner_ativo_ordem", columnList = "ativo, ordem"),
    @Index(name = "idx_banner_ordem", columnList = "ordem")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "subtitulo", length = 500)
    private String subtitulo;

    @Column(name = "imagem_url", nullable = false, length = 1000)
    private String imagemUrl;

    @Column(name = "link_url", length = 1000)
    private String linkUrl;

    @Column(name = "ordem", nullable = false)
    private Integer ordem = 0;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;
}
