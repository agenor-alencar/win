package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(length = 255, unique = true, nullable = false)
    private String email;

    @Column(name = "senha_hash", length = 255, nullable = false)
    private String senhaHash;

    @Column(length = 100, nullable = false)
    private String nome;

    @Column(length = 100, nullable = false)
    private String sobrenome;

    @Column(length = 14, unique = true)
    private String cpf;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatusUsuario status = StatusUsuario.ATIVO;

    @Column(name = "email_verificado")
    private Boolean emailVerificado = false;

    @Column(length = 20)
    private String telefone;

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;

    @Column(name = "ultimo_login", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime ultimoLogin;

    @Column(name = "url_imagem_perfil")
    private String urlImagemPerfil;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Endereco> enderecos;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UsuarioPerfil> usuarioPerfis;

    public enum StatusUsuario {
        ATIVO, INATIVO, SUSPENSO, PENDENTE
    }
}