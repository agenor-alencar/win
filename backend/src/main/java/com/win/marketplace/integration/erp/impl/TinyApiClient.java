package com.win.marketplace.integration.erp.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.integration.erp.ErpApiClient;
import com.win.marketplace.integration.erp.ErpIntegrationException;
import com.win.marketplace.integration.erp.dto.ErpProductDTO;
import com.win.marketplace.integration.erp.dto.ErpStockUpdateDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Cliente de integração com Tiny ERP
 * Documentação: https://tiny.com.br/api-docs
 */
@Slf4j
public class TinyApiClient implements ErpApiClient {
    
    private final String apiUrl;
    private final String apiToken;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public TinyApiClient(String apiUrl, String apiToken) {
        this.apiUrl = apiUrl != null ? apiUrl : "https://api.tiny.com.br/api2";
        this.apiToken = apiToken;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public Optional<ErpProductDTO> getErpProduct(String sku) {
        try {
            log.info("Buscando produto no Tiny - SKU: {}", sku);
            
            // Tiny usa formato específico de requisição
            String url = String.format("%s/produto.obter.php?token=%s&sku=%s&formato=json",
                apiUrl, apiToken, sku);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());
                
                // Tiny retorna estrutura específica
                if (json.has("retorno") && json.get("retorno").has("produto")) {
                    JsonNode produto = json.get("retorno").get("produto");
                    return Optional.of(parseProductFromJson(produto));
                }
            }
            
            return Optional.empty();
            
        } catch (Exception e) {
            log.error("Erro ao buscar produto do Tiny - SKU: {}", sku, e);
            throw new ErpIntegrationException("Erro ao buscar produto do Tiny: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<ErpStockUpdateDTO> getStockUpdates(List<String> skus) {
        try {
            log.info("Buscando estoque no Tiny - {} SKUs", skus.size());
            
            List<ErpStockUpdateDTO> updates = new ArrayList<>();
            
            // Tiny permite consultar múltiplos produtos em uma requisição
            String skusParam = String.join(",", skus);
            String url = String.format("%s/produtos.obter.estoques.php?token=%s&skus=%s&formato=json",
                apiUrl, apiToken, skusParam);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());
                
                if (json.has("retorno") && json.get("retorno").has("produtos")) {
                    JsonNode produtos = json.get("retorno").get("produtos");
                    
                    if (produtos.isArray()) {
                        for (JsonNode produto : produtos) {
                            updates.add(parseStockFromJson(produto));
                        }
                    }
                }
            }
            
            return updates;
            
        } catch (Exception e) {
            log.error("Erro ao buscar estoques do Tiny", e);
            throw new ErpIntegrationException("Erro ao buscar estoques do Tiny: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean testConnection() {
        try {
            log.info("Testando conexão com Tiny");
            
            String url = String.format("%s/info.php?token=%s&formato=json", apiUrl, apiToken);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("Erro ao testar conexão com Tiny", e);
            return false;
        }
    }
    
    @Override
    public String getErpName() {
        return "Tiny";
    }
    
    private ErpProductDTO parseProductFromJson(JsonNode json) {
        return ErpProductDTO.builder()
            .sku(json.has("codigo") ? json.get("codigo").asText() : null)
            .nome(json.has("nome") ? json.get("nome").asText() : null)
            .descricao(json.has("descricao_complementar") ? json.get("descricao_complementar").asText() : null)
            .preco(json.has("preco") ? new BigDecimal(json.get("preco").asText()) : BigDecimal.ZERO)
            .estoque(json.has("saldo") ? json.get("saldo").asInt() : 0)
            .codigoBarras(json.has("gtin") ? json.get("gtin").asText() : null)
            .pesoGramas(json.has("peso_bruto") ? (int)(json.get("peso_bruto").asDouble() * 1000) : null)
            .imagemUrl(json.has("anexos") && json.get("anexos").isArray() && json.get("anexos").size() > 0
                ? json.get("anexos").get(0).get("url").asText() : null)
            .marca(json.has("marca") ? json.get("marca").asText() : null)
            .categoria(json.has("classe_produto") ? json.get("classe_produto").asText() : null)
            .ativo(json.has("situacao") ? "A".equals(json.get("situacao").asText()) : true)
            .build();
    }
    
    private ErpStockUpdateDTO parseStockFromJson(JsonNode json) {
        return ErpStockUpdateDTO.builder()
            .sku(json.has("codigo") ? json.get("codigo").asText() : null)
            .estoque(json.has("saldo") ? json.get("saldo").asInt() : 0)
            .ativo(json.has("situacao") ? "A".equals(json.get("situacao").asText()) : true)
            .build();
    }
}
