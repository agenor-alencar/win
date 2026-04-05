package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Modelo para armazenar tokens OTP (One-Time Password) enviados via SMS
 * Tabela: otp_tokens
 * 
 * Campos:
 * - id: Identificador único do token OTP
 * - telefone: Número de telefone do usuário (formato: +5511999999999)
 * - codigo: Código numérico de 6 dígitos gerado aleatoriamente
 * - tentativas: Contador de tentativas de validação (máximo 3)
 * - valido: Flag indicando se o código ainda é válido (não foi usado)
 * - expiracao: Data/hora em que o código expira (TTL: 5 minutos)
 * - criadoEm: Timestamp de criação do registro
 * - atualizadoEm: Timestamp da última atualização
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "otp_tokens", indexes = {
    @Index(name = "idx_otp_telefone", columnList = "telefone"),
    @Index(name = "idx_otp_valido", columnList = "valido"),
    @Index(name = "idx_otp_expiracao", columnList = "expiracao")
})
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Número de telefone no formato internacional: +55 + DDD + 9 dígitos
     * Exemplo: +5511987654321
     */
    @Column(name = "telefone", nullable = false, length = 20)
    private String telefone;

    /**
     * Código OTP de 6 dígitos numéricos
     * Exemplo: 123456
     */
    @Column(name = "codigo", nullable = false, length = 6)
    private String codigo;

    /**
     * Contador de tentativas de validação
     * Máximo permitido: 3 tentativas incorretas
     * Após isso, o usuário deve solicitar um novo código
     */
    @Column(name = "tentativas", nullable = false)
    @Builder.Default
    private Integer tentativas = 0;

    /**
     * Flag indicando se o código ainda é válido e pode ser usado
     * - true: ainda pode ser usado (não expirou e não foi validado)
     * - false: já foi usado ou foi invalidado manualmente
     */
    @Column(name = "valido", nullable = false)
    @Builder.Default
    private Boolean valido = true;

    /**
     * Data e hora de expiração do código
     * Padrão: 5 minutos após a criação
     * Sistema realiza limpeza periódica via scheduler
     */
    @Column(name = "expiracao", nullable = false)
    private OffsetDateTime expiracao;

    /**
     * Timestamp de criação do registro
     * Utilizado para auditoria e análise de comportamento
     */
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    /**
     * Timestamp da última atualização
     * Utilizado para rastrear quando o código foi invalidado ou tentativas atualizadas
     */
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    /**
     * Callback JPA executado antes de persistir a entidade
     * Define automaticamente os timestamps de criação e atualização
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        criadoEm = now;
        atualizadoEm = now;
    }

    /**
     * Callback JPA executado antes de atualizar a entidade
     * Atualiza automaticamente o timestamp de modificação
     */
    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = OffsetDateTime.now();
    }

    /**
     * Verifica se o código OTP ainda está válido (não expirou)
     * @return true se o código ainda não expirou
     */
    public boolean isNotExpired() {
        return OffsetDateTime.now().isBefore(expiracao);
    }

    /**
     * Verifica se o código pode ser utilizado
     * Critério: deve ser válido E não deve ter expirado
     * @return true se o código pode ser usado
     */
    public boolean canBeUsed() {
        return valido && isNotExpired();
    }

    /**
     * Incrementa o contador de tentativas e retorna o novo valor
     * Utilizado quando o usuário tenta validar um código incorreto
     * @return número de tentativas após incremento
     */
    public Integer incrementTentativas() {
        this.tentativas++;
        return this.tentativas;
    }
}
