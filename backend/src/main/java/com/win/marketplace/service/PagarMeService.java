package com.win.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Serviço para integração com Pagar.me (Stone)
 * 
 * Documentação oficial: https://docs.pagar.me/reference/api-reference
 * 
 * Atualmente implementa:
 * - Pagamento via PIX
 * 
 * @author Win Marketplace
 * @version 1.0
 */
@Slf4j
@Service
public class PagarMeService {

    @Value("${pagarme.api-key:}")
    private String apiKey;

    @Value("${pagarme.public-key:}")
    private String publicKey;

    @Value("${pagarme.environment:test}")
    private String environment;

    @Value("${pagarme.enabled:false}")
    private Boolean enabled;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final RestTemplate restTemplate;

    // URL base da API Pagar.me (v5)
    private static final String BASE_URL = "https://api.pagar.me/core/v5";

    public PagarMeService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Cria uma cobrança PIX via Pagar.me
     * 
     * @param pedidoId ID único do pedido
     * @param valorCentavos Valor em centavos (ex: 1000 = R$ 10.00)
     * @param clienteNome Nome do cliente
     * @param clienteEmail Email do cliente
     * @param clienteCpf CPF do cliente (apenas números)
     * @param descricao Descrição do pagamento
     * @return Map contendo: id, qr_code, qr_code_url, status, expires_at
     */
    public Map<String, Object> criarCobrancaPix(
        String pedidoId,
        Integer valorCentavos,
        String clienteNome,
        String clienteEmail,
        String clienteCpf,
        String descricao
    ) {
        if (!enabled) {
            log.warn("⚠️ Pagar.me está DESABILITADO. Configure PAGARME_ENABLED=true");
            throw new RuntimeException("Gateway Pagar.me não está habilitado");
        }

        try {
            String endpoint = BASE_URL + "/orders";

            // Montar corpo da requisição
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("code", pedidoId);
            
            // Itens
            List<Map<String, Object>> items = new ArrayList<>();
            Map<String, Object> item = new HashMap<>();
            item.put("code", pedidoId);
            item.put("description", descricao != null ? descricao : "Pedido #" + pedidoId);
            item.put("amount", valorCentavos);
            item.put("quantity", 1);
            items.add(item);
            requestBody.put("items", items);

            // Cliente
            Map<String, Object> customer = new HashMap<>();
            customer.put("name", clienteNome);
            customer.put("email", clienteEmail);
            customer.put("type", "individual");
            
            // CPF (se fornecido)
            if (clienteCpf != null && !clienteCpf.isBlank()) {
                customer.put("document", clienteCpf.replaceAll("[^0-9]", ""));
                customer.put("document_type", "CPF");
            }
            
            requestBody.put("customer", customer);

            // Pagamento PIX
            List<Map<String, Object>> payments = new ArrayList<>();
            Map<String, Object> payment = new HashMap<>();
            payment.put("payment_method", "pix");
            payment.put("amount", valorCentavos);
            
            // Configurações PIX
            Map<String, Object> pix = new HashMap<>();
            pix.put("expires_in", 3600); // 1 hora
            payment.put("pix", pix);
            
            payments.add(payment);
            requestBody.put("payments", payments);

            // Metadata (informações adicionais)
            Map<String, String> metadata = new HashMap<>();
            metadata.put("pedido_id", pedidoId);
            metadata.put("environment", environment);
            requestBody.put("metadata", metadata);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(apiKey, ""); // Pagar.me usa Basic Auth com senha vazia

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("💳 Criando cobrança PIX Pagar.me - Pedido: {}, Valor: R$ {}", 
                pedidoId, valorCentavos / 100.0);

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // LOG: Resposta completa da API
                log.info("📦 Resposta completa do Pagar.me: {}", responseBody);
                
                // Extrair dados do PIX
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("id", responseBody.get("id"));
                resultado.put("code", responseBody.get("code"));
                resultado.put("status", responseBody.get("status"));
                resultado.put("amount", responseBody.get("amount"));
                
                // Verificar se há erros na resposta
                if ("failed".equals(responseBody.get("status"))) {
                    List<Map<String, Object>> charges = (List<Map<String, Object>>) responseBody.get("charges");
                    if (charges != null && !charges.isEmpty()) {
                        Map<String, Object> charge = charges.get(0);
                        Map<String, Object> lastTransaction = (Map<String, Object>) charge.get("last_transaction");
                        if (lastTransaction != null) {
                            log.error("❌ Cobrança falhou! Detalhes da transação: {}", lastTransaction);
                            Object gatewayResponse = lastTransaction.get("gateway_response");
                            if (gatewayResponse != null) {
                                log.error("❌ Gateway Response: {}", gatewayResponse);
                            }
                        }
                    }
                }
                
                // Extrair informações do PIX
                List<Map<String, Object>> charges = (List<Map<String, Object>>) responseBody.get("charges");
                if (charges != null && !charges.isEmpty()) {
                    Map<String, Object> charge = charges.get(0);
                    log.info("📋 Charge data: {}", charge);
                    Map<String, Object> lastTransaction = (Map<String, Object>) charge.get("last_transaction");
                    
                    if (lastTransaction != null) {
                        log.info("📋 Last transaction data: {}", lastTransaction);
                        resultado.put("qr_code", lastTransaction.get("qr_code"));
                        resultado.put("qr_code_url", lastTransaction.get("qr_code_url"));
                        resultado.put("expires_at", lastTransaction.get("expires_at"));
                        resultado.put("transaction_id", lastTransaction.get("id"));
                    }
                }
                
                log.info("✅ Cobrança PIX criada - ID: {}", resultado.get("id"));
                return resultado;
            }

            throw new RuntimeException("Erro ao criar cobrança PIX no Pagar.me");

        } catch (Exception e) {
            log.error("❌ Erro ao criar cobrança Pagar.me: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao processar pagamento PIX: " + e.getMessage());
        }
    }

    /**
     * Busca uma ordem/cobrança pelo ID
     * 
     * @param orderId ID da ordem no Pagar.me
     * @return Dados da ordem
     */
    public Map<String, Object> buscarOrdem(String orderId) {
        if (!enabled) {
            throw new RuntimeException("Gateway Pagar.me não está habilitado");
        }

        try {
            String endpoint = BASE_URL + "/orders/" + orderId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(apiKey, "");

            HttpEntity<?> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            throw new RuntimeException("Ordem não encontrada");

        } catch (Exception e) {
            log.error("❌ Erro ao buscar ordem: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar ordem: " + e.getMessage());
        }
    }

    /**
     * Cancela uma ordem no Pagar.me
     * 
     * @param orderId ID da ordem
     * @return Dados da ordem cancelada
     */
    public Map<String, Object> cancelarOrdem(String orderId) {
        if (!enabled) {
            throw new RuntimeException("Gateway Pagar.me não está habilitado");
        }

        try {
            String endpoint = BASE_URL + "/orders/" + orderId;

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(apiKey, "");

            HttpEntity<?> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.DELETE,
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("✅ Ordem cancelada: {}", orderId);
                return response.getBody();
            }

            throw new RuntimeException("Erro ao cancelar ordem");

        } catch (Exception e) {
            log.error("❌ Erro ao cancelar ordem: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao cancelar ordem: " + e.getMessage());
        }
    }

    /**
     * Traduz status do Pagar.me para status interno
     * 
     * Statuses Pagar.me:
     * - pending: Pendente de pagamento
     * - paid: Pago
     * - canceled: Cancelado
     * - failed: Falhou
     * - processing: Processando
     * 
     * @param pagarmeStatus Status do Pagar.me
     * @return Status interno do sistema
     */
    public String traduzirStatus(String pagarmeStatus) {
        if (pagarmeStatus == null) return "PENDENTE";
        
        return switch (pagarmeStatus.toLowerCase()) {
            case "pending" -> "PENDENTE";
            case "paid" -> "APROVADO";
            case "canceled", "cancelled" -> "CANCELADO";
            case "failed" -> "RECUSADO";
            case "processing" -> "PROCESSANDO";
            default -> "PENDENTE";
        };
    }

    /**
     * Valida webhook do Pagar.me
     * 
     * @param signature Assinatura recebida no header
     * @param payload Corpo da requisição
     * @return true se válido
     */
    public boolean validarWebhook(String signature, String payload) {
        // TODO: Implementar validação de assinatura do webhook
        // Documentação: https://docs.pagar.me/docs/webhooks-1
        log.warn("⚠️ Validação de webhook não implementada ainda");
        return true;
    }

    /**
     * Verifica se o serviço está habilitado
     */
    public boolean isEnabled() {
        return enabled != null && enabled && apiKey != null && !apiKey.isBlank();
    }

    /**
     * Retorna informações de configuração (para debug)
     */
    public Map<String, Object> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("enabled", isEnabled());
        info.put("environment", environment);
        info.put("hasApiKey", apiKey != null && !apiKey.isBlank());
        info.put("hasPublicKey", publicKey != null && !publicKey.isBlank());
        return info;
    }
}
