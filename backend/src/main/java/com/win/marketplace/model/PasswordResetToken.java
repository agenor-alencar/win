package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expira_em", nullable = false)
    private ZonedDateTime expiraEm;

    @Column(nullable = false)
    @Builder.Default
    private Boolean usado = false;

    @Column(name = "criado_em", nullable = false)
    @Builder.Default
    private ZonedDateTime criadoEm = ZonedDateTime.now();

    @Column(name = "usado_em")
    private ZonedDateTime usadoEm;

    public boolean isValido() {
        return !usado && ZonedDateTime.now().isBefore(expiraEm);
    }

    @PrePersist
    protected void onCreate() {
        if (criadoEm == null) {
            criadoEm = ZonedDateTime.now();
        }
        if (expiraEm == null) {
            expiraEm = criadoEm.plusHours(1); // Token válido por 1 hora
        }
    }
}
