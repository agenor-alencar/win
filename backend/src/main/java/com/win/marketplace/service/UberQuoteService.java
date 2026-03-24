package com.win.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.request.UberQuoteRequestDTO;
import com.win.marketplace.dto.response.UberQuoteResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Serviço para integração com Uber Direct - Create Quote API
 * 
 * Responsabilidades:
 * - Solicitar cotação de frete à Uber com base em coordenadas
 * - Calcular valor do frete para apresentar ao cliente
 * - Retornar quote_id para confirmar entrega depois
 * - Tratamento de erros
 * 
 * Fluxo:
 * 1. Cliente seleciona endereço de entrega no checkout
 * 2. Frontend chama geocoding para obter coordenadas (Passo 1)
 * 3. Frontend chama este serviço com coordenadas
 * 4. Recebe cotação, calcula margem Win, retorna ao cliente
 * 5. Cliente confirma compra
 * 6. Backend usa quote_id para confirmar entrega (Passo 4)
 * 
 * @author WinMarketplace Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UberQuoteService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final UberAuthService uberAuthService;

    @Value("${app.uber.direct.api-base-url:https://api.uber.com/v1/customers}")
    private String uberApiBaseUrl;

    @Value("${app.uber.direct.customer-id}")
    private String customerId;

    /**
     * Solicita uma cotação de frete à Uber Direct
     * 
     * Endpoint: POST {api-base-url}/{customer_id}/delivery_quotes
     * 
     * @param request DTO com coordenadas de coleta e entrega
     * @return Cotação com quote_id, valor, e tempos estimados
     * @throws RuntimeException Se houver erro na requisição
     */
    public UberQuoteResponseDTO solicitarCotacao(UberQuoteRequestDTO request) {
        try {
            log.info("📍 Solicitando cotação de frete à Uber para pedido: {}", request.getExternalId());
            log.debug("   Coleta: ({}, {})", 
                      request.getLocalizacaoColeta().getLatitude(),
                      request.getLocalizacaoColeta().getLongitude());
            log.debug("   Entrega: ({}, {})",
                      request.getLocalizacaoEntrega().getLatitude(),
                      request.getLocalizacaoEntrega().getLongitude());

            // 1. Obter token de acesso
            String accessToken = uberAuthService.obterAccessToken();
            
            // 2. Preparar headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("User-Agent", "WinMarketplace/2.0");

            // 3. Construir URL (sem trailing slash no customer_id)
            String url = String.format("%s/%s/delivery_quotes", uberApiBaseUrl, customerId);
            log.debug("📡 URL da requisição: {}", url);

            // 4. Preparar corpo da requisição
            String requestBody = objectMapper.writeValueAsString(request);
            log.debug("📦 Request body: {}", requestBody);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // 5. Fazer requisição
            log.info("🚀 Enviando requisição para Uber...");
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url,
                    entity,
                    String.class
            );

            // 6. Validar resposta
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.error("❌ Erro na resposta da Uber. Status: {}, Body: {}", 
                         response.getStatusCode(), response.getBody());
                throw new RuntimeException("Falha ao obter cotação - Status: " + response.getStatusCode());
            }

            // 7. Parse da resposta
            UberQuoteResponseDTO cotacao = objectMapper.readValue(
                    response.getBody(),
                    UberQuoteResponseDTO.class
            );

            log.info("✅ Cotação recebida com sucesso!");
            log.info("   Quote ID: {}", cotacao.getQuoteId());
            log.info("   Valor: R$ {}", cotacao.getValor());
            log.info("   Tempo coleta: {} segundos", cotacao.getTempoEstimadoColeta());
            log.info("   Tempo entrega: {} segundos", cotacao.getTempoEstimadoEntrega());

            return cotacao;

        } catch (RestClientException e) {
            log.error("❌ Erro de conexão ao chamar Uber API: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao conectar na API da Uber: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Erro ao processar cotação: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar cotação: " + e.getMessage(), e);
        }
    }

    /**
     * Calcula o preço final do frete cobrado ao cliente
     * 
     * Fórmula:
     * preço_cliente = (valor_uber * 1.10) arredondado
     * 
     * Exemplo:
     * - Uber cobra: R$ 45.00
     * - Taxa Win: 10% (R$ 4.50)
     * - Preço para cliente: R$ 49.50
     * 
     * @param valorUber Valor cobrado pela Uber
     * @return Valor com taxa Win (10%) incluída, arredondado
     */
    public java.math.BigDecimal calcularFreteComTaxa(java.math.BigDecimal valorUber) {
        java.math.BigDecimal taxa = java.math.BigDecimal.valueOf(1.10);
        java.math.BigDecimal freteComTaxa = valorUber.multiply(taxa);
        
        // Arredondar para cima (para o centavo mais próximo)
        return freteComTaxa.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Calcula a margem de lucro para o WIN
     * 
     * @param valorUber Valor cobrado pela Uber
     * @return Margem (10% do valor Uber)
     */
    public java.math.BigDecimal calcularMargemWin(java.math.BigDecimal valorUber) {
        return valorUber.multiply(java.math.BigDecimal.valueOf(0.10))
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
