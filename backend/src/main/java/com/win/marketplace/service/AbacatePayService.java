package com.win.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

/**
 * Serviço para integração com Abacate Pay
 * Documentação: https://docs.abacatepay.com
 */
@Slf4j
@Service
public class AbacatePayService {

    @Value("${abacatepay.api-key:}")
    private String apiKey;

    @Value("${abacatepay.api-url:https://api.abacatepay.com}")
    private String apiUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final RestTemplate restTemplate;

    public AbacatePayService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Cria uma cobrança PIX no Abacate Pay
     * 
     * @param pedidoId ID do pedido
     * @param amount Valor em centavos (ex: 1000 = R$ 10,00)
     * @param customerEmail Email do cliente
     * @param description Descrição do pagamento
     * @return Map contendo id, url, status da cobrança
     */
    public Map<String, Object> criarCobrancaPix(
        String pedidoId,
        Integer amount,
        String customerEmail,
        String description
    ) {
        try {
            String endpoint = apiUrl + "/billing/create";

            // Montar corpo da requisição
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("frequency", "ONE_TIME");
            requestBody.put("methods", Arrays.asList("PIX"));
            
            // Produtos
            Map<String, Object> product = new HashMap<>();
            product.put("externalId", pedidoId);
            product.put("name", description != null ? description : "Pedido " + pedidoId);
            product.put("quantity", 1);
            product.put("price", amount);
            product.put("description", description);
            requestBody.put("products", Arrays.asList(product));

            // URLs de retorno
            requestBody.put("returnUrl", frontendUrl + "/pedidos");
            requestBody.put("completionUrl", frontendUrl + "/pedido/sucesso");

            // Cliente
            if (customerEmail != null && !customerEmail.isBlank()) {
                Map<String, Object> customer = new HashMap<>();
                Map<String, String> metadata = new HashMap<>();
                metadata.put("email", customerEmail);
                customer.put("metadata", metadata);
                requestBody.put("customer", customer);
            }

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("🥑 Criando cobrança Abacate Pay - Pedido: {}, Valor: R$ {}", 
                pedidoId, amount / 100.0);

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                
                if (data != null) {
                    log.info("✅ Cobrança criada com sucesso - ID: {}", data.get("id"));
                    return data;
                }
            }

            throw new RuntimeException("Erro ao criar cobrança no Abacate Pay");

        } catch (Exception e) {
            log.error("❌ Erro ao criar cobrança Abacate Pay: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao processar pagamento com Abacate Pay: " + e.getMessage());
        }
    }

    /**
     * Busca uma cobrança pelo ID
     * 
     * @param billingId ID da cobrança no Abacate Pay
     * @return Dados da cobrança
     */
    public Map<String, Object> buscarCobranca(String billingId) {
        try {
            String endpoint = apiUrl + "/billing/get?id=" + billingId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);

            HttpEntity<?> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                return data;
            }

            throw new RuntimeException("Cobrança não encontrada");

        } catch (Exception e) {
            log.error("❌ Erro ao buscar cobrança: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar cobrança: " + e.getMessage());
        }
    }

    /**
     * Lista todas as cobranças
     * 
     * @return Lista de cobranças
     */
    public List<Map<String, Object>> listarCobrancas() {
        try {
            String endpoint = apiUrl + "/billing/list";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);

            HttpEntity<?> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> data = (List<Map<String, Object>>) responseBody.get("data");
                return data != null ? data : new ArrayList<>();
            }

            return new ArrayList<>();

        } catch (Exception e) {
            log.error("❌ Erro ao listar cobranças: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Traduz status do Abacate Pay para status interno
     * 
     * @param abacateStatus Status do Abacate Pay (PENDING, PAID, EXPIRED, CANCELLED, REFUNDED)
     * @return Status interno
     */
    public String traduzirStatus(String abacateStatus) {
        return switch (abacateStatus.toUpperCase()) {
            case "PENDING" -> "PENDENTE";
            case "PAID" -> "APROVADO";
            case "EXPIRED" -> "CANCELADO";
            case "CANCELLED" -> "CANCELADO";
            case "REFUNDED" -> "ESTORNADO";
            default -> "PROCESSANDO";
        };
    }

    /**
     * Converte BigDecimal para centavos (inteiro)
     * 
     * @param valor Valor em reais
     * @return Valor em centavos
     */
    public Integer converterParaCentavos(BigDecimal valor) {
        return valor.multiply(BigDecimal.valueOf(100)).intValue();
    }

    /**
     * Verifica se a API Key está configurada
     * 
     * @return true se configurada
     */
    public boolean isConfigurado() {
        return apiKey != null && !apiKey.isBlank();
    }
}
