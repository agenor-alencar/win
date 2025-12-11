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
 * Cliente de integração com NavSoft ERP
 * Documentação: https://api.navsoft.com.br/docs
 */
@Slf4j
public class NavSoftApiClient implements ErpApiClient {
    
    private final String apiUrl;
    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public NavSoftApiClient(String apiUrl, String apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public Optional<ErpProductDTO> getErpProduct(String sku) {
        try {
            log.info("Buscando produto no NavSoft - SKU: {}", sku);
            
            String url = apiUrl + "/produtos/" + sku;
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());
                return Optional.of(parseProductFromJson(json));
            }
            
            return Optional.empty();
            
        } catch (Exception e) {
            log.error("Erro ao buscar produto do NavSoft - SKU: {}", sku, e);
            throw new ErpIntegrationException("Erro ao buscar produto do NavSoft: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<ErpStockUpdateDTO> getStockUpdates(List<String> skus) {
        try {
            log.info("Buscando estoque no NavSoft - {} SKUs", skus.size());
            
            List<ErpStockUpdateDTO> updates = new ArrayList<>();
            
            // NavSoft requer uma requisição por SKU
            for (String sku : skus) {
                try {
                    String url = apiUrl + "/estoque/" + sku;
                    HttpHeaders headers = createHeaders();
                    HttpEntity<String> entity = new HttpEntity<>(headers);
                    
                    ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        String.class
                    );
                    
                    if (response.getStatusCode() == HttpStatus.OK) {
                        JsonNode json = objectMapper.readTree(response.getBody());
                        updates.add(parseStockFromJson(sku, json));
                    }
                    
                    // Rate limiting: aguardar 100ms entre requisições
                    Thread.sleep(100);
                    
                } catch (Exception e) {
                    log.warn("Erro ao buscar estoque do SKU {} no NavSoft: {}", sku, e.getMessage());
                }
            }
            
            return updates;
            
        } catch (Exception e) {
            log.error("Erro ao buscar estoques do NavSoft", e);
            throw new ErpIntegrationException("Erro ao buscar estoques do NavSoft: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean testConnection() {
        try {
            log.info("Testando conexão com NavSoft");
            
            String url = apiUrl + "/health";
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            return response.getStatusCode() == HttpStatus.OK;
            
        } catch (Exception e) {
            log.error("Erro ao testar conexão com NavSoft", e);
            return false;
        }
    }
    
    @Override
    public String getErpName() {
        return "NavSoft";
    }
    
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", apiKey);
        return headers;
    }
    
    private ErpProductDTO parseProductFromJson(JsonNode json) {
        return ErpProductDTO.builder()
            .sku(json.get("sku").asText())
            .nome(json.has("nome") ? json.get("nome").asText() : null)
            .descricao(json.has("descricao") ? json.get("descricao").asText() : null)
            .preco(json.has("preco") ? new BigDecimal(json.get("preco").asText()) : BigDecimal.ZERO)
            .estoque(json.has("estoque") ? json.get("estoque").asInt() : 0)
            .codigoBarras(json.has("codigoBarras") ? json.get("codigoBarras").asText() : null)
            .pesoGramas(json.has("peso") ? json.get("peso").asInt() : null)
            .imagemUrl(json.has("imagem") ? json.get("imagem").asText() : null)
            .marca(json.has("marca") ? json.get("marca").asText() : null)
            .categoria(json.has("categoria") ? json.get("categoria").asText() : null)
            .ativo(json.has("ativo") ? json.get("ativo").asBoolean() : true)
            .build();
    }
    
    private ErpStockUpdateDTO parseStockFromJson(String sku, JsonNode json) {
        return ErpStockUpdateDTO.builder()
            .sku(sku)
            .estoque(json.has("saldo") ? json.get("saldo").asInt() : 0)
            .ativo(json.has("ativo") ? json.get("ativo").asBoolean() : true)
            .build();
    }
}
