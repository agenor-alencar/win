package com.win.marketplace.service;

import com.win.marketplace.dto.request.VincularProdutoErpDTO;
import com.win.marketplace.integration.erp.ErpApiClient;
import com.win.marketplace.integration.erp.ErpClientFactory;
import com.win.marketplace.integration.erp.ErpIntegrationException;
import com.win.marketplace.integration.erp.dto.ErpProductDTO;
import com.win.marketplace.model.LojistaErpConfig;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Serviço para vinculação e sincronização de produtos com ERP
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProdutoErpService {
    
    private final ProdutoRepository produtoRepository;
    private final LojistaErpConfigService erpConfigService;
    private final ErpClientFactory erpClientFactory;
    
    /**
     * Busca produto no ERP por SKU (preview antes de vincular)
     */
    @Transactional(readOnly = true)
    public Optional<ErpProductDTO> buscarProdutoNoErp(UUID lojistaId, String erpSku) {
        log.info("Buscando produto no ERP - Lojista: {}, SKU: {}", lojistaId, erpSku);
        
        LojistaErpConfig config = erpConfigService.buscarConfiguracaoAtiva(lojistaId);
        
        if (config == null) {
            throw new IllegalStateException("Lojista não possui ERP configurado");
        }
        
        ErpApiClient client = erpClientFactory.createClient(config);
        return client.getErpProduct(erpSku);
    }
    
    /**
     * Vincula um produto existente do Win a um produto do ERP
     */
    @Transactional
    public Produto vincularProdutoErp(UUID lojistaId, VincularProdutoErpDTO dto) {
        log.info("Vinculando produto ao ERP - Produto: {}, SKU: {}", dto.produtoId(), dto.erpSku());
        
        // Busca produto
        Produto produto = produtoRepository.findById(dto.produtoId())
            .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        
        // Valida se produto pertence ao lojista
        if (!produto.getLojista().getId().equals(lojistaId)) {
            throw new IllegalArgumentException("Produto não pertence ao lojista");
        }
        
        // ✅ VALIDAÇÃO: Verifica se erpSku já está vinculado a outro produto
        Optional<Produto> produtoExistente = produtoRepository.findByErpSku(dto.erpSku());
        if (produtoExistente.isPresent() && !produtoExistente.get().getId().equals(dto.produtoId())) {
            throw new IllegalArgumentException(
                "SKU '" + dto.erpSku() + "' já está vinculado a outro produto: " + produtoExistente.get().getNome()
            );
        }
        
        // Busca configuração ERP
        LojistaErpConfig config = erpConfigService.buscarConfiguracaoAtiva(lojistaId);
        if (config == null) {
            throw new IllegalStateException("Lojista não possui ERP configurado");
        }
        
        // Define o SKU do ERP no produto
        produto.setErpSku(dto.erpSku());
        
        // Se solicitado, importa dados do ERP
        if (dto.importarDados()) {
            try {
                ErpApiClient client = erpClientFactory.createClient(config);
                Optional<ErpProductDTO> erpProduto = client.getErpProduct(dto.erpSku());
                
                if (erpProduto.isPresent()) {
                    atualizarDadosProduto(produto, erpProduto.get());
                    log.info("Dados importados do ERP com sucesso");
                } else {
                    log.warn("Produto não encontrado no ERP - Vinculando apenas o SKU");
                }
            } catch (ErpIntegrationException e) {
                log.error("Erro ao importar dados do ERP", e);
                throw new IllegalStateException("Erro ao buscar dados no ERP: " + e.getMessage(), e);
            }
        }
        
        return produtoRepository.save(produto);
    }
    
    /**
     * Desvincula produto do ERP (remove SKU)
     */
    @Transactional
    public void desvincularProduto(UUID produtoId) {
        log.info("Desvinculando produto do ERP: {}", produtoId);
        
        produtoRepository.findById(produtoId)
            .ifPresent(produto -> {
                produto.setErpSku(null);
                produtoRepository.save(produto);
            });
    }
    
    /**
     * Sincroniza estoque de um produto específico
     */
    @Transactional
    public void sincronizarEstoqueProduto(UUID produtoId) {
        log.info("Sincronizando estoque do produto: {}", produtoId);
        
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        
        if (produto.getErpSku() == null) {
            log.warn("Produto não está vinculado a um ERP");
            return;
        }
        
        UUID lojistaId = produto.getLojista().getId();
        LojistaErpConfig config = erpConfigService.buscarConfiguracaoAtiva(lojistaId);
        
        if (config == null) {
            log.warn("Lojista não possui ERP configurado");
            return;
        }
        
        try {
            ErpApiClient client = erpClientFactory.createClient(config);
            Optional<ErpProductDTO> erpProduto = client.getErpProduct(produto.getErpSku());
            
            if (erpProduto.isPresent()) {
                ErpProductDTO dados = erpProduto.get();
                produto.setEstoque(dados.getEstoque());
                
                // Se o produto estiver inativo no ERP, desativa no Win também
                if (Boolean.FALSE.equals(dados.getAtivo())) {
                    produto.setAtivo(false);
                }
                
                produtoRepository.save(produto);
                log.info("Estoque sincronizado - SKU: {}, Novo estoque: {}", produto.getErpSku(), dados.getEstoque());
            }
        } catch (Exception e) {
            log.error("Erro ao sincronizar estoque do produto {}", produtoId, e);
        }
    }
    
    /**
     * Atualiza dados do produto com informações do ERP
     */
    private void atualizarDadosProduto(Produto produto, ErpProductDTO erpDados) {
        // Atualiza apenas se o valor do ERP não for nulo
        if (erpDados.getNome() != null) {
            produto.setNome(erpDados.getNome());
        }
        if (erpDados.getDescricao() != null) {
            produto.setDescricao(erpDados.getDescricao());
        }
        if (erpDados.getPreco() != null) {
            produto.setPreco(erpDados.getPreco());
        }
        if (erpDados.getEstoque() != null) {
            produto.setEstoque(erpDados.getEstoque());
        }
        if (erpDados.getCodigoBarras() != null) {
            produto.setGtinEan(erpDados.getCodigoBarras());
        }
        if (erpDados.getPesoGramas() != null) {
            produto.setPesoKg(java.math.BigDecimal.valueOf(erpDados.getPesoGramas() / 1000.0));
        }
        if (erpDados.getAtivo() != null) {
            produto.setAtivo(erpDados.getAtivo());
        }
    }
}
