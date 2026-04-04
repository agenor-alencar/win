package com.win.marketplace.model;

import com.win.marketplace.model.enums.TipoPinValidacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade que representa uma validação de PIN code para prova de entrega.
 * 
 * PIN codes são enviados para o motorista no início da entrega (COLETA)
 * e para o cliente no final (ENTREGA) para confirmação.
 * 
 * O sistema protege contra brute force com:
 * - Limite de 3 tentativas
 * - Bloqueio por 15 minutos após 3 falhas
 * - Registro de auditoria completo
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pin_validacoes", indexes = {
    @Index(name = "idx_pin_entrega_id", columnList = "entrega_id"),
    @Index(name = "idx_pin_tipo", columnList = "tipo_pin_validacao"),
    @Index(name = "idx_pin_bloqueado_ate", columnList = "bloqueado_ate"),
    @Index(name = "idx_pin_criado_em", columnList = "criado_em")
})
public class PinValidacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ========================================
    // Relacionamento com Entrega
    // ========================================
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrega_id", nullable = false)
    private Entrega entrega;

    // ========================================
    // PIN Code (Criptografado)
    // ========================================
    
    /**
     * PIN code criptografado com AES-256-GCM.
     * Nunca armazenar PIN em texto plano.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String pinEncriptado;

    /**
     * IV (Initialization Vector) usado na criptografia, codificado em Base64.
     * Necessário para descriptografar o PIN durante validação.
     */
    @Column(nullable = false)
    private String iv;

    /**
     * Salt usado na derivação de chave. Codificado em Base64.
     */
    @Column(nullable = false)
    private String salt;

    // ========================================
    // Tipo de Validação
    // ========================================
    
    /**
     * Tipo de PIN:
     * - COLETA: PIN enviado ao motorista no início da entrega
     * - ENTREGA: PIN enviado ao cliente para confirmação de recebimento
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPinValidacao tipoPinValidacao;

    // ========================================
    // Controle de Tentativas
    // ========================================
    
    /**
     * Número de tentativas de validação realizadas.
     * Limite máximo: 3
     */
    @Column(nullable = false)
    private Integer numeroTentativas = 0;

    /**
     * Máximo de tentativas permitidas antes de bloqueio.
     */
    @Column(nullable = false)
    private Integer maxTentativas = 3;

    // ========================================
    // Validação e Auditoria
    // ========================================
    
    /**
     * Indica se o PIN foi validado com sucesso.
     */
    @Column(nullable = false)
    private Boolean validado = false;

    /**
     * Timestamp da validação bem-sucedida.
     */
    @Column(name = "data_validacao")
    private OffsetDateTime dataValidacao;

    /**
     * UUID do usuário que realizou a validação (motorista ou cliente).
     */
    @Column(name = "usuario_validador_id")
    private UUID usuarioValidadorId;

    /**
     * Endereço IP do cliente que realizou a tentativa de validação.
     */
    @Column(name = "ip_address")
    private String ipAddress;

    /**
     * User-Agent do navegador/app que realizou a tentativa.
     */
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    // ========================================
    // Proteção contra Brute Force
    // ========================================
    
    /**
     * Timestamp até o qual o PIN está bloqueado.
     * Após 3 tentativas falhas, o PIN fica bloqueado por 15 minutos.
     */
    @Column(name = "bloqueado_ate")
    private OffsetDateTime bloqueadoAte;

    /**
     * Motivo da última tentativa falha.
     */
    @Column(name = "motivo_falha")
    private String motivoFalha;

    // ========================================
    // Metadados Temporais
    // ========================================

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(nullable = false)
    private OffsetDateTime atualizadoEm;

    /**
     * Timestamp de expiração do PIN.
     * PIN geralmente expira 24 horas após criação.
     */
    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    // ========================================
    // Métodos Auxiliares
    // ========================================

    /**
     * Verifica se o PIN ainda está válido (não expirou).
     */
    public boolean isPinValido() {
        return OffsetDateTime.now().isBefore(this.expiraEm);
    }

    /**
     * Verifica se o PIN está bloqueado por brute force.
     */
    public boolean estaBloqueado() {
        if (bloqueadoAte == null) {
            return false;
        }
        return OffsetDateTime.now().isBefore(bloqueadoAte);
    }

    /**
     * Verifica se ainda existem tentativas disponíveis.
     */
    public boolean temTentativasDisponiveis() {
        return numeroTentativas < maxTentativas && !estaBloqueado();
    }

    /**
     * Incrementa o contador de tentativas.
     */
    public void incrementarTentativas() {
        this.numeroTentativas++;
        if (this.numeroTentativas >= maxTentativas && this.bloqueadoAte == null) {
            // Bloquear por 15 minutos
            this.bloqueadoAte = OffsetDateTime.now().plusMinutes(15);
        }
    }
}
