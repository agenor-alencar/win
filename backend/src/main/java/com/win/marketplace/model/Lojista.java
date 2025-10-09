package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "lojistas")
public class Lojista {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private Usuario usuario;

    @Column(name = "nome_loja", length = 200, nullable = false)
    private String nomeLoja;

    @Column(length = 18, unique = true, nullable = false)
    private String cnpj;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 100)
    private String categoria;

    @Column(nullable = false)
    private Boolean aprovado = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatusLojista status = StatusLojista.ATIVO;

    @Column(name = "data_aprovacao", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime dataAprovacao;

    @Column(name = "taxa_comissao", precision = 5, scale = 2)
    private BigDecimal taxaComissao = BigDecimal.valueOf(5.00);

    @Column(precision = 3, scale = 2)
    private BigDecimal avaliacao = BigDecimal.ZERO;

    @Column(name = "quantidade_avaliacoes")
    private Integer quantidadeAvaliacoes = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "horario_funcionamento", columnDefinition = "jsonb")
    private Map<String, Object> horarioFuncionamento;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conta_bancaria", columnDefinition = "jsonb")
    private Map<String, Object> contaBancaria;

    @Column(name = "inscricao_estadual", length = 20)
    private String inscricaoEstadual;

    @Column(name = "regime_tributario", length = 50)
    private String regimeTributario;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuracao_fiscal_api", columnDefinition = "jsonb")
    private Map<String, Object> configuracaoFiscalApi;

    public enum StatusLojista {
        ATIVO, INATIVO, SUSPENSO
    }
}