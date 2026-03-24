package com.win.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.request.UberOAuthTokenRequestDTO;
import com.win.marketplace.dto.response.UberOAuthTokenResponseDTO;
import com.win.marketplace.model.UberOAuthToken;
import com.win.marketplace.repository.UberOAuthTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Serviço de Autenticação OAuth com a Uber
 * 
 * Responsabilidades:
 * - Obter tokens de acesso da Uber usando Client Credentials Flow
 * - Cachear tokens em banco de dados para reutilização
 * - Gerenciar expiração e renovação de tokens
 * - Suportar múltiplos customer IDs (multi-tenant)
 * - Tratamento robusto de erros
 * 
 * Fluxo:
 * 1. Cliente solicita token
 * 2. Verificar cache (banco de dados)
 * 3. Se válido e não expirado, retornar
 * 4. Se expirado, solicitar novo à Uber
 * 5. Armazenar em banco de dados
 * 6. Retornar ao cliente
 * 
 * @author WinMarketplace Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UberAuthService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final UberOAuthTokenRepository tokenRepository;

    @Value("${app.uber.direct.oauth-url:https://auth.uber.com/oauth/v2/token}")
    private String uberOAuthUrl;

    @Value("${app.uber.direct.customer-id}")
    private String customerId;

    @Value("${app.uber.direct.client-id}")
    private String clientId;

    @Value("${app.uber.direct.client-secret}")
    private String clientSecret;

    /**
     * Obtém um token OAuth válido da Uber
     * 
     * Estratégia:
     * 1. Verificar se existe token válido em cache (banco de dados)
     * 2. Se válido, incrementar contador de uso e retornar
     * 3. Se inválido/expirado, obter novo token da Uber
     * 4. Armazenar novo token em banco de dados
     * 5. Retornar token
     * 
     * @return Token válido para usar na API da Uber
     * @throws RuntimeException Se não conseguir obter token
     */
    public String obterAccessToken() {
        log.info("🔐 Obtendo access token OAuth da Uber para customer: {}", customerId);

        // 1. Verificar cache
        Optional<UberOAuthToken> tokenCacheado = tokenRepository.findLatestValidToken(customerId);
        
        if (tokenCacheado.isPresent()) {
            UberOAuthToken token = tokenCacheado.get();
            
            if (token.isValido()) {
                log.info("✅ Token em cache ainda válido. Usos: {}", token.getTotalUsos());
                
                // Incrementar contador de usos
                token.registrarUso();
                tokenRepository.save(token);
                
                return token.getAccessToken();
            } else {
                log.warn("⚠️ Token em cache expirado. Solicitando novo...");
            }
        }

        // 2. Obter novo token da Uber
        log.info("📡 Solicitando novo token OAuth da Uber...");
        String novoToken = obterNovoTokenUber();
        
        log.info("✅ Token OAuth obtido com sucesso");
        return novoToken;
    }

    /**
     * Faz requisição POST ao servidor OAuth da Uber para obter novo token
     * 
     * Endpoint: POST https://auth.uber.com/oauth/v2/token
     * Body (x-www-form-urlencoded):
     *   - grant_type: "client_credentials"
     *   - client_id: seu Client ID
     *   - client_secret: seu Client Secret
     *   - scope: "delivery:write"
     * 
     * @return Access token para usar na Uber API
     * @throws RuntimeException Se houver erro na requisição
     */
    private String obterNovoTokenUber() {
        try {
            // Preparar requisição
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("User-Agent", "WinMarketplace/2.0");

            // Body em formato x-www-form-urlencoded
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("scope", "delivery:write");

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            log.debug("📡 POST {} com credentials", uberOAuthUrl);
            
            // Fazer requisição
            ResponseEntity<String> response = restTemplate.postForEntity(
                    uberOAuthUrl,
                    entity,
                    String.class
            );

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.error("❌ Erro na resposta OAuth da Uber. Status: {}", response.getStatusCode());
                throw new RuntimeException("Falha ao obter token OAuth - Status: " + response.getStatusCode());
            }

            // Parse da resposta
            UberOAuthTokenResponseDTO tokenResponse = objectMapper.readValue(
                    response.getBody(),
                    UberOAuthTokenResponseDTO.class
            );

            log.info("✅ Token OAuth recebido: tipo={}, escopo={}", 
                     tokenResponse.getTokenType(), tokenResponse.getScope());

            // Salvar em cache (banco de dados)
            UberOAuthToken tokenEntity = UberOAuthToken.builder()
                    .customerId(customerId)
                    .accessToken(tokenResponse.getAccessToken())
                    .tokenType(tokenResponse.getTokenType())
                    .scope(tokenResponse.getScope())
                    .expiraEm(OffsetDateTime.now().plusSeconds(tokenResponse.getExpiresIn()))
                    .ativo(true)
                    .totalUsos(1L)
                    .ultimoUso(OffsetDateTime.now())
                    .build();

            UberOAuthToken tokenSalvo = tokenRepository.save(tokenEntity);
            
            log.info("✅ Token armazenado em cache - ID: {}, Expira em: {}", 
                     tokenSalvo.getId(), tokenSalvo.getExpiraEm());

            return tokenResponse.getAccessToken();

        } catch (RestClientException e) {
            log.error("❌ Erro de conexão ao OAuth Uber: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao conectar no servidor OAuth da Uber: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Erro ao processar token OAuth: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar token OAuth: " + e.getMessage(), e);
        }
    }

    /**
     * Revoga um token específico
     * Útil se detectar que o token está inválido
     * 
     * @param tokenId ID do token a revogar
     */
    public void revogarToken(String tokenId) {
        log.warn("🚫 Revogando token: {}", tokenId);
        
        Optional<UberOAuthToken> token = tokenRepository.findById(java.util.UUID.fromString(tokenId));
        
        if (token.isPresent()) {
            UberOAuthToken t = token.get();
            t.marcarRevogado("REVOGADO_PELO_SISTEMA");
            tokenRepository.save(t);
            log.info("✅ Token revogado com sucesso");
        }
    }

    /**
     * Limpa tokens expirados do banco de dados
     * Deve ser executado periodicamente por um scheduler
     */
    public void limparTokensExpirados() {
        log.info("🧹 Limpando tokens expirados...");
        
        OffsetDateTime dataLimite = OffsetDateTime.now().minusHours(24);
        java.util.List<UberOAuthToken> tokensExpirados = tokenRepository.findExiredTokensBefore(dataLimite);
        
        if (!tokensExpirados.isEmpty()) {
            tokenRepository.deleteAll(tokensExpirados);
            log.info("✅ {} tokens expirados removidos do banco", tokensExpirados.size());
        }
    }

    /**
     * Obtém estatísticas dos tokens em cache
     */
    public java.util.Map<String, Object> obterEstatisticasTokens() {
        java.util.List<UberOAuthToken> tokens = tokenRepository.findByCustomerIdAndAtivoTrue(customerId);
        
        int totalValidos = (int) tokens.stream().filter(UberOAuthToken::isValido).count();
        long totalUsos = tokens.stream().mapToLong(UberOAuthToken::getTotalUsos).sum();
        
        return new java.util.HashMap<String, Object>() {{
            put("total_tokens_ativos", tokens.size());
            put("total_tokens_validos", totalValidos);
            put("total_usos", totalUsos);
            put("customer_id", customerId);
        }};
    }

    /**
     * Valida se as credenciais da Uber estão configuradas
     */
    public Boolean validarConfiguracao() {
        boolean valido = customerId != null && !customerId.isEmpty()
                && clientId != null && !clientId.isEmpty()
                && clientSecret != null && !clientSecret.isEmpty();
        
        if (!valido) {
            log.error("❌ Credenciais Uber não configuradas. Verifique:");
            log.error("   - UBER_CUSTOMER_ID");
            log.error("   - UBER_CLIENT_ID");
            log.error("   - UBER_CLIENT_SECRET");
        }
        
        return valido;
    }
}
