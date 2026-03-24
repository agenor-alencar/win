package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade para cache de tokens OAuth da Uber
 * 
 * Responsabilidades:
 * - Armazenar access tokens obtidos da Uber
 * - Rastrear tempo de expiração
 * - Permitir reuso do token até sua expiração (evita chamadas repetidas)
 * - Multi-tenant: cada lojista pode ter seu próprio token ou token compartilhado
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "uber_oauth_tokens", indexes = {
    @Index(name = "idx_uber_token_customer_id", columnList = "customer_id"),
    @Index(name = "idx_uber_token_ativo", columnList = "ativo"),
    @Index(name = "idx_uber_token_expira_em", columnList = "expira_em")
})
public class UberOAuthToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    /**
     * Customer ID da Uber (identificador único do comerciante)
     * Pode ser null se usar token global para todos os lojistas
     */
    @Column(name = "customer_id", length = 255, nullable = false)
    private String customerId;
    
    /**
     * Access token obtido da Uber
     * Usado no header Authorization: Bearer {accessToken}
     */
    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken;
    
    /**
     * Tipo de token (geralmente "Bearer")
     */
    @Column(name = "token_type", nullable = false, length = 50)
    private String tokenType = "Bearer";
    
    /**
     * Escopo do token (ex: "delivery:write")
     */
    @Column(name = "scope", length = 255)
    private String scope;
    
    /**
     * Timestamp quando o token vai expirar
     */
    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;
    
    /**
     * Indica se o token ainda está válido
     * Falso se manual revogado ou expirou
     */
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;
    
    /**
     * Número de vezes que este token foi usado
     * Útil para auditoria
     */
    @Column(name = "total_usos", nullable = false)
    private Long totalUsos = 0L;
    
    /**
     * Último uso do token
     */
    @Column(name = "ultimo_uso")
    private OffsetDateTime ultimoUso;
    
    /**
     * Motivo da desativação (se ativo = false)
     * Ex: "EXPIRADO", "REVOGADO_MANUALMENTE", "ERRO_AUTENTICACAO"
     */
    @Column(name = "motivo_desativacao", length = 255)
    private String motivoDesativacao;
    
    /**
     * Data/hora de criação
     */
    @Column(name = "criado_em", nullable = false, updatable = false)
    @CreationTimestamp
    private OffsetDateTime criadoEm;
    
    /**
     * Data/hora de última atualização
     */
    @Column(name = "atualizado_em", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime atualizadoEm;
    
    // ====================================
    // Métodos auxiliares
    // ====================================
    
    /**
     * Verifica se o token ainda está válido
     */
    public Boolean isValido() {
        if (!ativo) {
            return false;
        }
        
        // Token expira em 5 minutos (buffer de segurança)
        OffsetDateTime agora = OffsetDateTime.now();
        OffsetDateTime buffer = expiraEm.minusMinutes(5);
        
        return agora.isBefore(buffer);
    }
    
    /**
     * Incrementa contador de usos e atualiza último uso
     */
    public void registrarUso() {
        this.totalUsos++;
        this.ultimoUso = OffsetDateTime.now();
    }
    
    /**
     * Marca token como expirado
     */
    public void marcarExpirado() {
        this.ativo = false;
        this.motivoDesativacao = "EXPIRADO";
    }
    
    /**
     * Marca token como revogado
     */
    public void marcarRevogado(String motivo) {
        this.ativo = false;
        this.motivoDesativacao = motivo;
    }
}
