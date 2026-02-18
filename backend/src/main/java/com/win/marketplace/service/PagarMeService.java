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
     * Cria uma cobrança PIX via Pagar.me com split de pagamento
     * 
     * @param pedidoId ID único do pedido
     * @param valorCentavos Valor em centavos (ex: 1000 = R$ 10.00)
     * @param clienteNome Nome do cliente
     * @param clienteEmail Email do cliente
     * @param clienteCpf CPF do cliente (apenas números)
     * @param descricao Descrição do pagamento
     * @param recipientIdMarketplace ID do recipient do marketplace (conta principal)
     * @param recipientIdLojista ID do recipient do lojista
     * @param valorFretecentavos Valor do frete em centavos
     * @param percentualComissao Percentual de comissão do marketplace (ex: 12.00 = 12%)
     * @return Map contendo: id, qr_code, qr_code_url, status, expires_at
     */
    public Map<String, Object> criarCobrancaPix(
        String pedidoId,
        Integer valorCentavos,
        String clienteNome,
        String clienteEmail,
        String clienteCpf,
        String clienteTelefone,
        String descricao,
        String recipientIdMarketplace,
        String recipientIdLojista,
        Integer valorFreteCentavos,
        BigDecimal percentualComissao
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
            
            // Telefone (obrigatório para PIX)
            if (clienteTelefone != null && !clienteTelefone.isBlank()) {
                String telefoneNumeros = clienteTelefone.replaceAll("[^0-9]", "");
                Map<String, Object> phones = new HashMap<>();
                Map<String, String> mobilePhone = new HashMap<>();
                
                // Formato: (DD) 9XXXX-XXXX -> 11 dígitos ou (DD) XXXX-XXXX -> 10 dígitos
                if (telefoneNumeros.length() >= 10) {
                    mobilePhone.put("country_code", "55");
                    mobilePhone.put("area_code", telefoneNumeros.substring(0, 2));
                    mobilePhone.put("number", telefoneNumeros.substring(2));
                    phones.put("mobile_phone", mobilePhone);
                    customer.put("phones", phones);
                } else {
                    log.warn("⚠️ Telefone inválido: {}. PIX pode falhar.", clienteTelefone);
                }
            } else {
                log.warn("⚠️ Telefone não fornecido. Alguns gateways podem rejeitar.");
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
            
            // === SPLIT DE PAGAMENTO ===
            // Divide o valor entre marketplace e lojista
            if (recipientIdMarketplace != null && recipientIdLojista != null) {
                List<Map<String, Object>> splits = new ArrayList<>();
                
                // Calcular valores do split
                int valorProdutosCentavos = valorCentavos - valorFreteCentavos;
                
                // Split 1: Marketplace recebe comissão dos produtos + frete integral
                int comissaoCentavos = (int) Math.round(valorProdutosCentavos * percentualComissao.doubleValue() / 100);
                int splitMarketplace = comissaoCentavos + valorFreteCentavos;
                
                Map<String, Object> splitMarket = new HashMap<>();
                splitMarket.put("recipient_id", recipientIdMarketplace);
                splitMarket.put("amount", splitMarketplace);
                splitMarket.put("type", "flat"); // valor fixo
                splitMarket.put("options", Map.of(
                    "liable", true,      // responsável por chargeback
                    "charge_processing_fee", true  // paga taxa de processamento
                ));
                splits.add(splitMarket);
                
                // Split 2: Lojista recebe o restante (produtos - comissão)
                int splitLojista = valorProdutosCentavos - comissaoCentavos;
                
                Map<String, Object> splitLoj = new HashMap<>();
                splitLoj.put("recipient_id", recipientIdLojista);
                splitLoj.put("amount", splitLojista);
                splitLoj.put("type", "flat");
                splitLoj.put("options", Map.of(
                    "liable", false,     // não responsável por chargeback
                    "charge_processing_fee", false  // não paga taxa
                ));
                splits.add(splitLoj);
                
                payment.put("split", splits);
                
                log.info("💰 Split configurado - Marketplace: R$ {} ({}% + frete), Lojista: R$ {}",
                    splitMarketplace / 100.0, percentualComissao, splitLojista / 100.0);
            } else {
                log.warn("⚠️ Split NÃO configurado - Recipients não informados");
            }
            
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

    /**
     * Cria um recipient (recebedor) no Pagar.me
     * 
     * @param nome Nome completo ou razão social
     * @param documento CPF ou CNPJ (apenas números)
     * @param email Email do recebedor
     * @param tipo "individual" (CPF) ou "company" (CNPJ)
     * @param dadosBancarios Map com: bank_code, agencia, agencia_dv, conta, conta_dv, type, holder_name, holder_document
     * @return Map contendo o ID do recipient criado
     */
    public Map<String, Object> criarRecipient(
        String nome,
        String documento,
        String email,
        String tipo,
        Map<String, String> dadosBancarios
    ) {
        if (!enabled) {
            throw new RuntimeException("Gateway Pagar.me não está habilitado");
        }

        try {
            String endpoint = BASE_URL + "/recipients";

            // Mapear dados bancários para o formato do Pagar.me
            Map<String, Object> bankAccount = new HashMap<>();
            bankAccount.put("holder_name", dadosBancarios.get("holder_name"));
            bankAccount.put("holder_document", dadosBancarios.get("holder_document").replaceAll("[^0-9]", ""));
            bankAccount.put("holder_type", tipo); // "individual" ou "company"
            bankAccount.put("bank", dadosBancarios.get("bank_code")); // Código do banco
            bankAccount.put("branch_number", dadosBancarios.get("agencia")); // Agência
            bankAccount.put("branch_check_digit", dadosBancarios.get("agencia_dv")); // DV da agência
            bankAccount.put("account_number", dadosBancarios.get("conta")); // Número da conta
            bankAccount.put("account_check_digit", dadosBancarios.get("conta_dv")); // DV da conta
            
            // Mapear tipo de conta: conta_corrente -> checking, conta_poupanca -> savings
            String accountType = dadosBancarios.get("type");
            if ("conta_poupanca".equals(accountType)) {
                bankAccount.put("type", "savings");
            } else {
                bankAccount.put("type", "checking");
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", nome);
            requestBody.put("email", email);
            requestBody.put("document", documento.replaceAll("[^0-9]", ""));
            requestBody.put("type", tipo); // "individual" ou "company"
            requestBody.put("payment_mode", "bank_transfer");
            requestBody.put("default_bank_account", bankAccount);

            // Configurações de transferência
            Map<String, Object> transferSettings = new HashMap<>();
            transferSettings.put("transfer_enabled", true);
            transferSettings.put("transfer_interval", "Daily");
            transferSettings.put("transfer_day", 0); // D+0
            requestBody.put("transfer_settings", transferSettings);

            // Configurações de antecipação automática (desabilitada)
            requestBody.put("automatic_anticipation_settings", new HashMap<>());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(apiKey, "");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("🏦 Criando recipient no Pagar.me - Nome: {}, Documento: {}, Banco: {}", 
                nome, documento, dadosBancarios.get("bank_code"));

            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                String recipientId = (String) responseBody.get("id");
                
                log.info("✅ Recipient criado com sucesso - ID: {}", recipientId);
                
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("id", recipientId);
                resultado.put("status", responseBody.get("status"));
                resultado.put("name", responseBody.get("name"));
                return resultado;
            }

            throw new RuntimeException("Erro ao criar recipient no Pagar.me");

        } catch (Exception e) {
            log.error("❌ Erro ao criar recipient: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar recipient: " + e.getMessage());
        }
    }

    /**
     * Busca um recipient pelo ID
     */
    public Map<String, Object> buscarRecipient(String recipientId) {
        if (!enabled) {
            throw new RuntimeException("Gateway Pagar.me não está habilitado");
        }

        try {
            String endpoint = BASE_URL + "/recipients/" + recipientId;

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

            throw new RuntimeException("Recipient não encontrado");

        } catch (Exception e) {
            log.error("❌ Erro ao buscar recipient: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao consultar recipient: " + e.getMessage());
        }
    }
}
