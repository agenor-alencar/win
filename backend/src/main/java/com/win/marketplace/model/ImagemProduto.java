package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "imagens_produto")
public class ImagemProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String url;

    private Boolean principal;

    @Column(name = "nome_arquivo", nullable = false)
    private String nomeArquivo;

    @Column(name = "tipo_arquivo", nullable = false)
    private String tipoArquivo;

    @Column(name = "tamanho_arquivo", nullable = false)
    private Long tamanhoArquivo;

    @Lob
    @Column(name = "dados_imagem", columnDefinition = "BYTEA")
    private byte[] dadosImagem;

    @Column(name = "ordem_exibicao")
    private Integer ordemExibicao;

    private Boolean ativo;
}