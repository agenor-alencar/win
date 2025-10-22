package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notificacoes", indexes = {
    @Index(name = "idx_notificacao_usuario", columnList = "usuario_id"),
    @Index(name = "idx_notificacao_lida", columnList = "lida")
})
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // ✅ String ao invés de enum: "INFO", "AVISO", "ERRO", "SUCESSO"

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "mensagem", nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @Column(name = "canal", nullable = false, length = 50)
    private String canal; // ✅ String ao invés de enum: "SISTEMA", "EMAIL", "SMS", "PUSH"

    @Column(name = "lida", nullable = false)
    private Boolean lida = false;

    @Column(name = "data_leitura")
    private OffsetDateTime dataLeitura;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = OffsetDateTime.now();
        if (lida == null) {
            lida = false;
        }
        if (tipo == null) {
            tipo = "INFO";
        }
        if (canal == null) {
            canal = "SISTEMA";
        }
    }
}