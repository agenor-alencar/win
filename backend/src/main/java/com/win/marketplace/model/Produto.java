package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id", nullable = false)
    private Lojista lojista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(length = 255, nullable = false)
    private String nome;

    @Column(length = 300, unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal preco;

    @Column(name = "preco_comparacao", precision = 10, scale = 2)
    private BigDecimal precoComparacao;

    @Column(nullable = false)
    private Integer estoque = 0;

    @Column(name = "controlar_estoque", nullable = false)
    private Boolean controlarEstoque = true;

    @Column(name = "peso_kg", precision = 8, scale = 3)
    private BigDecimal pesoKg;

    @Column(name = "comprimento_cm", precision = 8, scale = 2)
    private BigDecimal comprimentoCm;

    @Column(name = "largura_cm", precision = 8, scale = 2)
    private BigDecimal larguraCm;

    @Column(name = "altura_cm", precision = 8, scale = 2)
    private BigDecimal alturaCm;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private StatusProduto status = StatusProduto.RASCUNHO;

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;

    @Column(precision = 3, scale = 2)
    private BigDecimal avaliacao = BigDecimal.ZERO;

    @Column(name = "quantidade_avaliacoes")
    private Integer quantidadeAvaliacoes = 0;

    @Column(name = "quantidade_vendas")
    private Integer quantidadeVendas = 0;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImagemProduto> imagens;

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariacaoProduto> variacoes;

    public enum StatusProduto {
        RASCUNHO, ATIVO, INATIVO
    }
}