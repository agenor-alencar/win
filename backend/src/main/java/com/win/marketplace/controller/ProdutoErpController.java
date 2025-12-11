package com.win.marketplace.controller;

import com.win.marketplace.dto.request.VincularProdutoErpDTO;
import com.win.marketplace.integration.erp.dto.ErpProductDTO;
import com.win.marketplace.model.Produto;
import com.win.marketplace.service.ProdutoErpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller para operações de ERP relacionadas a produtos
 */
@RestController
@RequestMapping("/api/v1/lojista/produtos/erp")
@RequiredArgsConstructor
@Slf4j
public class ProdutoErpController {
    
    private final ProdutoErpService produtoErpService;
    
    /**
     * Busca produto no ERP por SKU (preview antes de vincular)
     */
    @GetMapping("/buscar")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<ErpProductDTO> buscarProdutoNoErp(
            @RequestParam UUID lojistaId,
            @RequestParam String erpSku) {
        
        log.info("Buscando produto no ERP - Lojista: {}, SKU: {}", lojistaId, erpSku);
        
        // TODO: Validar se o usuário autenticado é dono do lojista
        return produtoErpService.buscarProdutoNoErp(lojistaId, erpSku)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Vincula produto existente ao ERP
     */
    @PostMapping("/vincular")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<Produto> vincularProduto(
            @RequestParam UUID lojistaId,
            @Valid @RequestBody VincularProdutoErpDTO dto) {
        
        log.info("Vinculando produto ao ERP - Produto: {}, SKU: {}", dto.produtoId(), dto.erpSku());
        
        // TODO: Validar se o usuário autenticado é dono do lojista
        Produto produto = produtoErpService.vincularProdutoErp(lojistaId, dto);
        
        return ResponseEntity.ok(produto);
    }
    
    /**
     * Desvincula produto do ERP
     */
    @DeleteMapping("/desvincular/{produtoId}")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<Void> desvincularProduto(@PathVariable UUID produtoId) {
        log.info("Desvinculando produto do ERP: {}", produtoId);
        
        // TODO: Validar se o usuário autenticado é dono do produto
        produtoErpService.desvincularProduto(produtoId);
        
        return ResponseEntity.ok().build();
    }
    
    /**
     * Sincroniza estoque de um produto manualmente
     */
    @PostMapping("/sincronizar/{produtoId}")
    @PreAuthorize("hasRole('LOJISTA')")
    public ResponseEntity<Void> sincronizarEstoque(@PathVariable UUID produtoId) {
        log.info("Sincronizando estoque do produto: {}", produtoId);
        
        // TODO: Validar se o usuário autenticado é dono do produto
        produtoErpService.sincronizarEstoqueProduto(produtoId);
        
        return ResponseEntity.ok().build();
    }
}
