package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "imagem_produto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImagemProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "url_thumbnail", length = 500)
    private String urlThumbnail;

    @Column(name = "url_medium", length = 500)
    private String urlMedium;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "tamanho_thumbnail_bytes")
    private Long tamanhoThumbnailBytes;

    @Column(name = "tamanho_medium_bytes")
    private Long tamanhoMediumBytes;

    @Column(name = "tipo_conteudo", length = 100)
    private String tipoConteudo;

    @Column(name = "texto_alternativo", length = 200)
    private String textoAlternativo;

    @Column(name = "ordem_exibicao")
    private Integer ordemExibicao = 0;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;
}