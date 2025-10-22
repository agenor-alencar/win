package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@EqualsAndHashCode(exclude = {"lojista", "categoria", "imagens", "itensPedido", "avaliacoes"})
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "produtos", indexes = {
    @Index(name = "idx_produto_nome", columnList = "nome"),
    @Index(name = "idx_produto_lojista", columnList = "lojista_id"),
    @Index(name = "idx_produto_categoria", columnList = "categoria_id"),
    @Index(name = "idx_produto_ativo", columnList = "ativo")
})
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id", nullable = false)
    private Lojista lojista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "preco", nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "estoque", nullable = false)
    private Integer estoque = 0;

    @Column(name = "peso_kg", precision = 8, scale = 3)
    private BigDecimal pesoKg;

    @Column(name = "comprimento_cm", precision = 8, scale = 2)
    private BigDecimal comprimentoCm;

    @Column(name = "largura_cm", precision = 8, scale = 2)
    private BigDecimal larguraCm;

    @Column(name = "altura_cm", precision = 8, scale = 2)
    private BigDecimal alturaCm;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "avaliacao", precision = 3, scale = 2)
    private BigDecimal avaliacao;

    @Column(name = "quantidade_avaliacoes")
    private Integer quantidadeAvaliacoes = 0;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ImagemProduto> imagens = new HashSet<>();

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ItemPedido> itensPedido = new HashSet<>();

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AvaliacaoProduto> avaliacoes = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        criadoEm = now;
        atualizadoEm = now;
        if (ativo == null) {
            ativo = true;
        }
        if (estoque == null) {
            estoque = 0;
        }
        if (quantidadeAvaliacoes == null) {
            quantidadeAvaliacoes = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = OffsetDateTime.now();
    }
}