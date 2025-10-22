package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lojistas")
@Data
@EqualsAndHashCode(exclude = {"usuario"})
@NoArgsConstructor
@AllArgsConstructor
public class Lojista {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(unique = true, nullable = false, length = 14)
    private String cnpj;

    @Column(name = "nome_fantasia", nullable = false, length = 200)
    private String nomeFantasia;

    @Column(name = "razao_social", nullable = false, length = 200)
    private String razaoSocial;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 20)
    private String telefone;

    // Campos de Endereço
    @Column(length = 8)
    private String cep;

    @Column(length = 255)
    private String logradouro;

    @Column(length = 10)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(length = 100)
    private String bairro;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String uf;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;
}