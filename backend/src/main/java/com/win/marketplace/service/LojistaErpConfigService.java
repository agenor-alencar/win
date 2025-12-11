package com.win.marketplace.service;

import com.win.marketplace.dto.request.ErpConfigDTO;
import com.win.marketplace.dto.response.ErpConfigResponseDTO;
import com.win.marketplace.integration.erp.ErpApiClient;
import com.win.marketplace.integration.erp.ErpClientFactory;
import com.win.marketplace.integration.erp.ErpIntegrationException;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.LojistaErpConfig;
import com.win.marketplace.model.enums.ErpType;
import com.win.marketplace.repository.LojistaErpConfigRepository;
import com.win.marketplace.repository.LojistaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Serviço para gerenciar configurações de ERP dos lojistas
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LojistaErpConfigService {
    
    private final LojistaErpConfigRepository erpConfigRepository;
    private final LojistaRepository lojistaRepository;
    private final EncryptionService encryptionService;
    private final ErpClientFactory erpClientFactory;
    
    /**
     * Configura ou atualiza integração ERP do lojista
     */
    @Transactional
    public ErpConfigResponseDTO configurarErp(UUID lojistaId, ErpConfigDTO dto) {
        log.info("Configurando ERP para lojista: {} - Tipo: {}", lojistaId, dto.erpType());
        
        Lojista lojista = lojistaRepository.findById(lojistaId)
            .orElseThrow(() -> new IllegalArgumentException("Lojista não encontrado"));
        
        // Busca configuração existente ou cria nova
        LojistaErpConfig config = erpConfigRepository.findByLojistaId(lojistaId)
            .orElse(LojistaErpConfig.builder()
                .lojista(lojista)
                .build());
        
        // Atualiza dados
        config.setErpType(dto.erpType());
        config.setApiUrl(dto.apiUrl() != null ? dto.apiUrl() : dto.erpType().getDefaultApiUrl());
        config.setSyncFrequencyMinutes(dto.syncFrequencyMinutes());
        config.setSyncEnabled(dto.syncEnabled());
        config.setAtivo(true);
        
        // Criptografa e salva API Key se fornecida
        if (dto.apiKey() != null && !dto.apiKey().isBlank()) {
            String encrypted = encryptionService.encrypt(dto.apiKey());
            config.setApiKeyEncrypted(encrypted);
        }
        
        // Testa conexão antes de salvar (exceto para modo MANUAL)
        if (dto.erpType() != ErpType.MANUAL && dto.apiKey() != null) {
            try {
                ErpApiClient client = erpClientFactory.createClient(config);
                boolean connected = client.testConnection();
                
                if (!connected) {
                    throw new ErpIntegrationException("Falha ao testar conexão com o ERP");
                }
                
                log.info("Conexão com ERP testada com sucesso");
            } catch (Exception e) {
                log.error("Erro ao testar conexão com ERP", e);
                throw new ErpIntegrationException("Erro ao conectar com o ERP: " + e.getMessage(), e);
            }
        }
        
        LojistaErpConfig saved = erpConfigRepository.save(config);
        log.info("Configuração ERP salva com sucesso - ID: {}", saved.getId());
        
        return ErpConfigResponseDTO.fromEntity(saved);
    }
    
    /**
     * Busca configuração ERP do lojista
     */
    @Transactional(readOnly = true)
    public ErpConfigResponseDTO buscarConfiguracao(UUID lojistaId) {
        log.info("Buscando configuração ERP do lojista: {}", lojistaId);
        
        return erpConfigRepository.findByLojistaIdAndAtivoTrue(lojistaId)
            .map(ErpConfigResponseDTO::fromEntity)
            .orElse(null);
    }
    
    /**
     * Desvincula ERP do lojista (desativa a configuração)
     */
    @Transactional
    public void desvincularErp(UUID lojistaId) {
        log.info("Desvinculando ERP do lojista: {}", lojistaId);
        
        erpConfigRepository.findByLojistaId(lojistaId)
            .ifPresent(config -> {
                config.setAtivo(false);
                config.setSyncEnabled(false);
                erpConfigRepository.save(config);
                log.info("ERP desvinculado com sucesso");
            });
    }
    
    /**
     * Lista todas as configurações ativas para sincronização
     */
    @Transactional(readOnly = true)
    public List<LojistaErpConfig> buscarConfiguracoesParaSync() {
        return erpConfigRepository.findAllActiveForSync();
    }
    
    /**
     * Busca configuração ERP ativa do lojista (para uso interno)
     */
    @Transactional(readOnly = true)
    public LojistaErpConfig buscarConfiguracaoAtiva(UUID lojistaId) {
        return erpConfigRepository.findByLojistaIdAndAtivoTrue(lojistaId)
            .orElse(null);
    }
    
    /**
     * Atualiza status da última sincronização
     */
    @Transactional
    public void atualizarStatusSync(UUID configId, boolean sucesso, String erro) {
        erpConfigRepository.findById(configId)
            .ifPresent(config -> {
                if (sucesso) {
                    config.markSyncSuccess();
                } else {
                    config.markSyncFailure(erro);
                }
                erpConfigRepository.save(config);
            });
    }
}
