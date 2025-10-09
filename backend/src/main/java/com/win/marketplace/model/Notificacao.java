package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notificacoes")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensagem;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoNotificacao tipo;

    @Column(nullable = false)
    private Boolean lida = false;

    @Column(name = "link_destino", columnDefinition = "TEXT")
    private String linkDestino;

    @Column(name = "criado_em", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @CreationTimestamp
    private OffsetDateTime criadoEm;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private CanalNotificacao canal;

    public enum TipoNotificacao {
        PEDIDO, PROMOCAO, SISTEMA, AVISO
    }

    public enum CanalNotificacao {
        EMAIL, PUSH, WHATSAPP, SMS, SISTEMA
    }
}