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
 * Entidade para armazenar dados bancários dos lojistas
 * Utilizada para criar recipients automaticamente no Pagar.me
 */
@Entity
@Table(name = "dados_bancarios_lojista")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DadosBancarios {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id", nullable = false, unique = true)
    private Lojista lojista;

    // Dados do titular
    @Column(name = "titular_nome", nullable = false, length = 200)
    private String titularNome;

    @Column(name = "titular_documento", nullable = false, length = 14)
    private String titularDocumento; // CPF ou CNPJ

    @Column(name = "titular_tipo", nullable = false, length = 20)
    private String titularTipo; // "individual" (CPF) ou "company" (CNPJ)

    // Dados bancários
    @Column(name = "codigo_banco", nullable = false, length = 3)
    private String codigoBanco; // Ex: 001 (Banco do Brasil), 341 (Itaú), 237 (Bradesco)

    @Column(name = "agencia", nullable = false, length = 10)
    private String agencia;

    @Column(name = "agencia_dv", length = 1)
    private String agenciaDv; // Dígito verificador da agência (opcional)

    @Column(name = "conta", nullable = false, length = 20)
    private String conta;

    @Column(name = "conta_dv", nullable = false, length = 2)
    private String contaDv; // Dígito verificador da conta

    @Column(name = "tipo_conta", nullable = false, length = 20)
    private String tipoConta; // "conta_corrente" ou "conta_poupanca"

    @Column(name = "validado", nullable = false)
    private Boolean validado = false; // Se a conta foi validada no Pagar.me

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;
}
