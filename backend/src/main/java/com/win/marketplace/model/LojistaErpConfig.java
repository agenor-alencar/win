package com.win.marketplace.model;

import com.win.marketplace.model.enums.ErpType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Configuração de integração ERP por lojista.
 * Cada lojista pode ter um ERP diferente com suas próprias credenciais.
 */
@Entity
@Table(name = "lojista_erp_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LojistaErpConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * Lojista dono desta configuração
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lojista_id", nullable = false, unique = true)
    private Lojista lojista;

    /**
     * Tipo de ERP configurado
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "erp_type", nullable = false, length = 50)
    private ErpType erpType;

    /**
     * URL base da API do ERP
     */
    @Column(name = "api_url", length = 500)
    private String apiUrl;

    /**
     * Chave de API criptografada (AES-256)
     * NUNCA expor este valor em APIs públicas
     */
    @Column(name = "api_key_encrypted", length = 1000)
    private String apiKeyEncrypted;

    /**
     * Token adicional (se o ERP usar OAuth ou similar)
     */
    @Column(name = "access_token_encrypted", length = 1000)
    private String accessTokenEncrypted;

    /**
     * Frequência de sincronização de estoque em minutos
     * Padrão: 5 minutos
     */
    @Column(name = "sync_frequency_minutes", nullable = false)
    @Builder.Default
    private Integer syncFrequencyMinutes = 5;

    /**
     * Se a sincronização automática está ativa
     */
    @Column(name = "sync_enabled", nullable = false)
    @Builder.Default
    private Boolean syncEnabled = true;

    /**
     * Última sincronização bem-sucedida
     */
    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    /**
     * Status da última sincronização
     */
    @Column(name = "last_sync_status", length = 50)
    private String lastSyncStatus;

    /**
     * Mensagem de erro da última sincronização (se houver)
     */
    @Column(name = "last_sync_error", columnDefinition = "TEXT")
    private String lastSyncError;

    /**
     * Configuração ativa
     */
    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    /**
     * Verifica se está na hora de sincronizar novamente
     */
    public boolean shouldSync() {
        if (!syncEnabled || !ativo || erpType == ErpType.MANUAL) {
            return false;
        }
        
        if (lastSyncAt == null) {
            return true; // Primeira sincronização
        }
        
        LocalDateTime nextSync = lastSyncAt.plusMinutes(syncFrequencyMinutes);
        return LocalDateTime.now().isAfter(nextSync);
    }

    /**
     * Marca sincronização como bem-sucedida
     */
    public void markSyncSuccess() {
        this.lastSyncAt = LocalDateTime.now();
        this.lastSyncStatus = "SUCCESS";
        this.lastSyncError = null;
    }

    /**
     * Marca sincronização como falha
     */
    public void markSyncFailure(String errorMessage) {
        this.lastSyncAt = LocalDateTime.now();
        this.lastSyncStatus = "FAILURE";
        this.lastSyncError = errorMessage;
    }
}
