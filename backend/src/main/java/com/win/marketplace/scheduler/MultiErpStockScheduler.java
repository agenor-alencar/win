package com.win.marketplace.scheduler;

import com.win.marketplace.integration.erp.ErpApiClient;
import com.win.marketplace.integration.erp.ErpClientFactory;
import com.win.marketplace.integration.erp.dto.ErpStockUpdateDTO;
import com.win.marketplace.model.LojistaErpConfig;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.service.LojistaErpConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Scheduler para sincronização automática de estoque com múltiplos ERPs.
 * Executa a cada minuto, verificando quais lojistas estão prontos para sincronizar.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MultiErpStockScheduler {
    
    private final LojistaErpConfigService erpConfigService;
    private final ErpClientFactory erpClientFactory;
    private final ProdutoRepository produtoRepository;
    
    /**
     * Executa sincronização de estoque a cada minuto para todos os lojistas configurados.
     * Cada lojista tem sua própria frequência de sincronização respeitada.
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 60000) // 1 minuto
    public void sincronizarEstoques() {
        log.debug("Iniciando verificação de sincronização de estoques ERP");
        
        try {
            List<LojistaErpConfig> configs = erpConfigService.buscarConfiguracoesParaSync();
            
            if (configs.isEmpty()) {
                log.debug("Nenhuma configuração ERP ativa para sincronização");
                return;
            }
            
            log.info("Encontradas {} configurações ERP ativas", configs.size());
            
            // Filtra apenas configurações que devem ser sincronizadas agora
            List<LojistaErpConfig> configsParaSync = configs.stream()
                .filter(LojistaErpConfig::shouldSync)
                .collect(Collectors.toList());
            
            if (configsParaSync.isEmpty()) {
                log.debug("Nenhuma configuração ERP pronta para sincronização neste momento");
                return;
            }
            
            log.info("Sincronizando {} lojistas", configsParaSync.size());
            
            // Executa sincronização de cada lojista em paralelo
            List<CompletableFuture<Void>> futures = configsParaSync.stream()
                .map(this::sincronizarLojistaAsync)
                .collect(Collectors.toList());
            
            // Aguarda todas as sincronizações completarem
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            log.info("Sincronização de estoques concluída");
            
        } catch (Exception e) {
            log.error("Erro ao executar sincronização de estoques", e);
        }
    }
    
    /**
     * Sincroniza produtos de um lojista específico de forma assíncrona
     */
    @Async
    public CompletableFuture<Void> sincronizarLojistaAsync(LojistaErpConfig config) {
        return CompletableFuture.runAsync(() -> sincronizarLojista(config));
    }
    
    /**
     * Sincroniza produtos de um lojista específico
     */
    private void sincronizarLojista(LojistaErpConfig config) {
        log.info("Iniciando sincronização para lojista {} - ERP: {}", 
            config.getLojista().getId(), config.getErpType());
        
        try {
            // Busca produtos vinculados ao ERP deste lojista
            List<Produto> produtos = produtoRepository.findByLojistaIdAndErpSkuIsNotNull(
                config.getLojista().getId()
            );
            
            if (produtos.isEmpty()) {
                log.info("Lojista {} não possui produtos vinculados ao ERP", 
                    config.getLojista().getId());
                config.markSyncSuccess();
                erpConfigService.atualizarStatusSync(config.getId(), true, null);
                return;
            }
            
            log.info("Sincronizando {} produtos do lojista {}", 
                produtos.size(), config.getLojista().getId());
            
            // Cria cliente ERP
            ErpApiClient client = erpClientFactory.createClient(config);
            
            // Coleta SKUs
            List<String> skus = produtos.stream()
                .map(Produto::getErpSku)
                .collect(Collectors.toList());
            
            // Busca atualizações de estoque em lote
            List<ErpStockUpdateDTO> updates = client.getStockUpdates(skus);
            
            // Aplica atualizações
            int atualizados = 0;
            for (ErpStockUpdateDTO update : updates) {
                produtos.stream()
                    .filter(p -> update.getSku().equals(p.getErpSku()))
                    .findFirst()
                    .ifPresent(produto -> {
                        produto.setEstoque(update.getEstoque());
                        
                        // Se produto inativo no ERP, desativa no Win
                        if (Boolean.FALSE.equals(update.getAtivo())) {
                            produto.setAtivo(false);
                        }
                        
                        produtoRepository.save(produto);
                    });
                atualizados++;
            }
            
            log.info("Sincronização concluída - Lojista: {}, Produtos atualizados: {}/{}", 
                config.getLojista().getId(), atualizados, produtos.size());
            
            config.markSyncSuccess();
            erpConfigService.atualizarStatusSync(config.getId(), true, null);
            
        } catch (Exception e) {
            log.error("Erro ao sincronizar lojista {} - ERP: {}", 
                config.getLojista().getId(), config.getErpType(), e);
            
            String errorMsg = "Erro: " + e.getMessage();
            config.markSyncFailure(errorMsg);
            erpConfigService.atualizarStatusSync(config.getId(), false, errorMsg);
        }
    }
}
