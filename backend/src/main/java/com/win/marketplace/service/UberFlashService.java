package com.win.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.request.SolicitacaoCorridaUberRequestDTO;
import com.win.marketplace.dto.response.DeliveryStatusResponseDTO;
import com.win.marketplace.dto.response.SimulacaoFreteResponseDTO;
import com.win.marketplace.dto.response.SolicitacaoCorridaUberResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * Service responsável pela integração com a API Uber Direct.
 * 
 * Implementa integração completa com a Uber Direct API incluindo:
 * - Autenticação OAuth 2.0 (Client Credentials)
 * - Cotação de frete em tempo real
 * - Solicitação de entregas
 * - Cancelamento de entregas
 * - Cache de token de acesso
 * - Tratamento robusto de erros
 * 
 * Documentação: https://developer.uber.com/docs/deliveries
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UberFlashService {

    private final RestTemplate restTemplate;
    private final GeocodingService geocodingService;
    private final ConfiguracaoService configuracaoService;

    @Value("${uber.client.id:}")
    private String uberClientId;

    @Value("${uber.client.secret:}")
    private String uberClientSecret;

    @Value("${uber.api.base-url:https://api.uber.com}")
    private String uberApiBaseUrl;

    @Value("${uber.api.enabled:false}")
    private Boolean uberApiEnabled;

    // Cache simples de token OAuth
    private String cachedAccessToken;
    private Instant tokenExpiresAt;

    // ========================================
    // AUTENTICAÇÃO OAUTH 2.0
    // ========================================

    /**
     * Obtém access token da Uber via OAuth 2.0 Client Credentials.
     * Implementa cache para evitar requisições desnecessárias.
     * 
     * @return Access token válido
     * @throws RuntimeException se falhar autenticação
     */
    private String obterAccessToken() {
        // Verifica se há token em cache válido
        if (cachedAccessToken != null && tokenExpiresAt != null 
                && Instant.now().isBefore(tokenExpiresAt)) {
            log.debug("Usando access token em cache");
            return cachedAccessToken;
        }

        log.info("Obtendo novo access token da Uber via OAuth 2.0");

        try {
            // Validar credenciais
            if (uberClientId == null || uberClientId.isEmpty() 
                    || uberClientSecret == null || uberClientSecret.isEmpty()) {
                throw new RuntimeException("Credenciais Uber não configuradas. " +
                        "Configure UBER_CLIENT_ID e UBER_CLIENT_SECRET no .env");
            }

            // Preparar requisição OAuth 2.0
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            if (uberClientId != null && uberClientSecret != null) {
                headers.setBasicAuth(uberClientId, uberClientSecret);
            }

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("scope", "delivery");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            // Fazer requisição
            String tokenUrl = "https://auth.uber.com/oauth/v2/token";
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    tokenUrl, request, JsonNode.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode responseBody = response.getBody();
                
                // Extrair token e tempo de expiração
                if (responseBody != null) {
                    cachedAccessToken = responseBody.get("access_token").asText();
                    int expiresIn = responseBody.get("expires_in").asInt();
                    
                    // Renovar token 5 minutos antes de expirar
                    tokenExpiresAt = Instant.now().plusSeconds(expiresIn - 300);
                    
                    log.info("Access token obtido com sucesso. Expira em {} segundos", expiresIn);
                    return cachedAccessToken;
                }
            } else {
                throw new RuntimeException("Resposta inválida do servidor OAuth: " + 
                        response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            log.error("Erro HTTP ao autenticar na Uber: {} - {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Falha na autenticação Uber: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro ao obter access token da Uber", e);
            throw new RuntimeException("Erro na autenticação Uber: " + e.getMessage(), e);
        }
        // Nunca atingido, mas necessário para satisfazer o compilador
        return null;
    }

    /**
     * Cria headers padrão para requisições à API Uber.
     */
    private HttpHeaders criarHeadersAutenticados() {
        String token = obterAccessToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) {
            headers.setBearerAuth(token);
        }
        headers.set("Accept", "application/json");
        
        return headers;
    }

    /**
     * Obtém taxa de comissão sobre frete configurada no sistema.
     * Retorna valor decimal (ex: 10.00 = 10%)
     */
    private BigDecimal obterTaxaComissaoFrete() {
        try {
            return configuracaoService.buscarConfigInterna().getTaxaComissaoFrete();
        } catch (Exception e) {
            log.warn("Erro ao buscar taxa de comissão, usando padrão de 10%", e);
            return new BigDecimal("10.00");
        }
    }

    // ========================================
    // COTAÇÃO DE FRETE (QUOTE)
    // ========================================

    /**
     * Simula o custo de uma corrida Uber Direct.
     * Se uber.api.enabled=true, faz chamada real à API.
     * Caso contrário, usa simulação mock para desenvolvimento.
     * 
     * @param request Dados para simulação (origem, destino, peso)
     * @return Simulação com valores calculados
     */
    public SimulacaoFreteResponseDTO simularFrete(SimulacaoFreteRequestDTO request) {
        log.info("Simulando frete Uber Direct - Origem: {}, Destino: {}, Peso: {}kg",
                request.getCepOrigem(), request.getCepDestino(), request.getPesoTotalKg());

        try {
            if (uberApiEnabled) {
                try {
                    return simularFreteApiReal(request);
                } catch (Exception e) {
                    log.warn("❌ API Uber falhou, usando simulação local: {}", e.getMessage());
                    return simularFreteMock(request);
                }
            } else {
                log.info("Modo MOCK ativo - usando simulação local");
                return simularFreteMock(request);
            }
        } catch (Exception e) {
            log.error("Erro ao simular frete Uber Direct", e);
            return SimulacaoFreteResponseDTO.builder()
                    .sucesso(false)
                    .erro("Erro ao simular frete: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Cotação real via API Uber Direct.
     * Endpoint: POST /v1/customers/{customer_id}/delivery_quotes
     */
    private SimulacaoFreteResponseDTO simularFreteApiReal(SimulacaoFreteRequestDTO request) {
        log.info("Realizando cotação real via API Uber Direct");

        try {
            // 1. GEOCODIFICAR ORIGEM (se não informado)
            if (request.getOrigemLatitude() == null || request.getOrigemLongitude() == null) {
                log.info("Geocodificando origem - CEP: {}", request.getCepOrigem());
                Double[] coordOrigem = geocodingService.geocodificar(
                        request.getCepOrigem(), 
                        request.getEnderecoOrigemCompleto()
                );
                
                if (coordOrigem != null) {
                    request.setOrigemLatitude(coordOrigem[0]);
                    request.setOrigemLongitude(coordOrigem[1]);
                    log.info("Origem geocodificada: lat={}, lon={}", coordOrigem[0], coordOrigem[1]);
                } else {
                    throw new RuntimeException("Não foi possível geocodificar o endereço de origem: " + 
                            request.getEnderecoOrigemCompleto());
                }
            }

            // 2. GEOCODIFICAR DESTINO (se não informado)
            if (request.getDestinoLatitude() == null || request.getDestinoLongitude() == null) {
                log.info("Geocodificando destino - CEP: {}", request.getCepDestino());
                Double[] coordDestino = geocodingService.geocodificar(
                        request.getCepDestino(), 
                        request.getEnderecoDestinoCompleto()
                );
                
                if (coordDestino != null) {
                    request.setDestinoLatitude(coordDestino[0]);
                    request.setDestinoLongitude(coordDestino[1]);
                    log.info("Destino geocodificado: lat={}, lon={}", coordDestino[0], coordDestino[1]);
                } else {
                    throw new RuntimeException("Não foi possível geocodificar o endereço de destino: " + 
                            request.getEnderecoDestinoCompleto());
                }
            }

            // 3. PREPARAR REQUEST PARA UBER API (FORMATO CORRETO)
            // Preparar body da requisição conforme API Uber Direct
            Map<String, Object> quoteRequest = new HashMap<>();
            
            // TOP-LEVEL: Endereños em formato texto (obrigatório para Uber)
            quoteRequest.put("pickup_address", request.getEnderecoOrigemCompleto());
            quoteRequest.put("dropoff_address", request.getEnderecoDestinoCompleto());
            
            // TOP-LEVEL: Localização com coordenadas (obrigatório)
            Map<String, Double> pickupLocation = new HashMap<>();
            pickupLocation.put("latitude", request.getOrigemLatitude());
            pickupLocation.put("longitude", request.getOrigemLongitude());
            quoteRequest.put("pickup_location", pickupLocation);
            
            Map<String, Double> dropoffLocation = new HashMap<>();
            dropoffLocation.put("latitude", request.getDestinoLatitude());
            dropoffLocation.put("longitude", request.getDestinoLongitude());
            quoteRequest.put("dropoff_location", dropoffLocation);
            
            // OPCIONAL: Contatos (recomendado)
            if (request.getNomeLojista() != null || request.getTelefoneLojista() != null) {
                Map<String, Object> pickupContact = new HashMap<>();
                if (request.getNomeLojista() != null) {
                    pickupContact.put("name", request.getNomeLojista());
                }
                if (request.getTelefoneLojista() != null) {
                    Map<String, Object> pickupPhone = new HashMap<>();
                    pickupPhone.put("number", limparTelefone(request.getTelefoneLojista()));
                    pickupContact.put("phone", pickupPhone);
                }
                quoteRequest.put("pickup_contact", pickupContact);
            }
            
            if (request.getNomeCliente() != null || request.getTelefoneCliente() != null) {
                Map<String, Object> dropoffContact = new HashMap<>();
                if (request.getNomeCliente() != null) {
                    dropoffContact.put("name", request.getNomeCliente());
                }
                if (request.getTelefoneCliente() != null) {
                    Map<String, Object> dropoffPhone = new HashMap<>();
                    dropoffPhone.put("number", limparTelefone(request.getTelefoneCliente()));
                    dropoffContact.put("phone", dropoffPhone);
                }
                quoteRequest.put("dropoff_contact", dropoffContact);
            }
            
            // Tipo de veículo baseado no peso
            var tipoVeiculo = request.getTipoVeiculoCalculado();
            String vehicleType = tipoVeiculo.name().contains("MOTO") ? "motorcycle" : "car";
            quoteRequest.put("vehicle_type", vehicleType);
            
            // Adicionar manifest (informações do pedido)
            if (request.getPedidoId() != null) {
                Map<String, Object> manifest = new HashMap<>();
                manifest.put("description", "Pedido Win Marketplace #" + 
                        request.getPedidoId().toString().substring(0, 8));
                
                if (request.getValorTotalPedido() != null) {
                    // Converter para centavos
                    int totalValueCents = request.getValorTotalPedido()
                            .multiply(BigDecimal.valueOf(100))
                            .intValue();
                    manifest.put("total_value", totalValueCents);
                }
                
                quoteRequest.put("manifest", manifest);
            }
            
            // Adicionar ação padrão caso não seja possível entregar
            quoteRequest.put("undeliverable_action", "return_to_sender");
            
            // Adicionar tempo de preparação do pedido (15 minutos padrão)
            quoteRequest.put("courier_imminent_pickup_time", 15);

            // Fazer requisição
            HttpHeaders headers = criarHeadersAutenticados();
            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(quoteRequest, headers);
            
            String quoteUrl = uberApiBaseUrl + "/v1/customers/me/delivery_quotes";
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    quoteUrl, httpRequest, JsonNode.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return processarRespostaCotacao(response.getBody(), tipoVeiculo);
            } else {
                throw new RuntimeException("Resposta inválida da API Uber: " + 
                        response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            log.error("Erro HTTP ao cotar frete na Uber: {} - {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            
            // Se erro 400/404, pode ser endereço inválido - tentar mock
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST || 
                    e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Endereço não encontrado pela Uber, usando simulação mock");
                return simularFreteMock(request);
            }
            
            throw new RuntimeException("Erro ao cotar frete: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao cotar frete via Uber API", e);
            throw new RuntimeException("Erro na cotação: " + e.getMessage(), e);
        }
    }

    /**
     * Processa resposta da API Uber e monta DTO de resposta.
     */
    private SimulacaoFreteResponseDTO processarRespostaCotacao(
            JsonNode responseBody, com.win.marketplace.model.enums.TipoVeiculoUber tipoVeiculo) {
        
        try {
            // Extrair dados da resposta
            JsonNode quote = responseBody.get("quotes").get(0);
            
            // ID da cotação (essencial para solicitar entrega com preço garantido)
            String quoteId = quote.get("id").asText();
            
            // Valor da corrida Uber (em centavos)
            int priceCents = quote.get("price").asInt();
            BigDecimal valorCorridaUber = BigDecimal.valueOf(priceCents)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            // Taxa de comissão (configurável pelo admin)
            BigDecimal taxaComissaoPct = obterTaxaComissaoFrete(); // Ex: 10.00 = 10%
            BigDecimal taxaWin = valorCorridaUber
                    .multiply(taxaComissaoPct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);
            
            log.debug("Taxa de comissão aplicada: {}% | Valor Uber: R$ {} | Comissão: R$ {}", 
                    taxaComissaoPct, valorCorridaUber, taxaWin);
            
            // Valor total SEM arredondamento (para cálculo interno)
            BigDecimal valorFreteExato = valorCorridaUber
                    .add(taxaWin)
                    .setScale(2, RoundingMode.HALF_UP);
            
            // ARREDONDAMENTO INTELIGENTE
            // Valores terminam sempre em X,90 ou X,00
            BigDecimal valorFreteTotal = aplicarArredondamentoInteligente(valorFreteExato);
            
            // Recalcular taxa Win baseado no valor arredondado
            // (para manter transparência: valor total = valor uber + taxa)
            taxaWin = valorFreteTotal.subtract(valorCorridaUber);
            
            // Tempo estimado (em segundos)
            int durationSeconds = quote.get("duration").asInt();
            int tempoEstimado = durationSeconds / 60;
            
            // Distância (em metros)
            int distanceMeters = quote.get("distance").asInt();
            double distanciaKm = distanceMeters / 1000.0;
            
            log.info("Cotação recebida - Quote ID: {}, Valor Uber: R$ {}, Valor Cliente: R$ {} (arredondado), Distância: {}km, Tempo: {}min",
                    quoteId, valorCorridaUber, valorFreteTotal, distanciaKm, tempoEstimado);
            
            return SimulacaoFreteResponseDTO.builder()
                    .sucesso(true)
                    .quoteId(quoteId) // ✅ SALVAR QUOTE ID
                    .tipoVeiculo(tipoVeiculo)
                    .valorCorridaUber(valorCorridaUber)
                    .taxaWinmarket(taxaWin)
                    .valorFreteTotal(valorFreteTotal)
                    .valorOriginalCotado(valorFreteExato) // ✅ VALOR ANTES DO ARREDONDAMENTO
                    .distanciaKm(distanciaKm)
                    .tempoEstimadoMinutos(tempoEstimado)
                    .mensagem(String.format("Entrega expressa em até %d minutos", tempoEstimado))
                    .build();
                    
        } catch (Exception e) {
            log.error("Erro ao processar resposta da cotação Uber", e);
            throw new RuntimeException("Erro ao processar cotação: " + e.getMessage(), e);
        }
    }
    
    /**
     * Arredonda valor do frete de forma inteligente.
     * Regra: Valores SEMPRE arredondam PARA CIMA terminando em X,90
     * 
     * Exemplos (conforme explicado pelo cliente):
     * - R$ 9,47 (Uber) + 10% = R$ 10,417 → R$ 10,90
     * - R$ 15,32 (Uber) + 10% = R$ 16,852 → R$ 16,90
     * - R$ 22,78 (Uber) + 10% = R$ 25,058 → R$ 25,90
     * 
     * Benefícios:
     * 1. Valores mais "redondos" para o cliente
     * 2. Margem de segurança para variações de preço
     * 3. Cobre possíveis flutuações da API Uber
     */
    private BigDecimal aplicarArredondamentoInteligente(BigDecimal valorExato) {
        // Pegar parte inteira
        BigDecimal parteInteira = valorExato.setScale(0, RoundingMode.DOWN);
        BigDecimal parteDecimal = valorExato.subtract(parteInteira);
        
        // Se parte decimal for menor ou igual a 0.90, arredondar para X,90
        if (parteDecimal.compareTo(BigDecimal.valueOf(0.90)) <= 0) {
            BigDecimal valorArredondado = parteInteira.add(BigDecimal.valueOf(0.90));
            log.debug("Arredondamento inteligente: R$ {} → R$ {}", valorExato, valorArredondado);
            return valorArredondado;
        }
        
        // Se parte decimal for maior que 0.90, arredondar para próximo inteiro + 0.90
        BigDecimal valorArredondado = parteInteira.add(BigDecimal.ONE).add(BigDecimal.valueOf(0.90));
        log.debug("Arredondamento inteligente: R$ {} → R$ {}", valorExato, valorArredondado);
        
        return valorArredondado;
    }

    /**
     * Simulação MOCK de frete (para desenvolvimento/testes).
     * Usado quando uber.api.enabled=false ou como fallback.
     */
    private SimulacaoFreteResponseDTO simularFreteMock(SimulacaoFreteRequestDTO request) {
        log.debug("Executando simulação MOCK de frete");
        
        // Cálculo fictício baseado em distância estimada e tipo de veículo
        double distanciaEstimadaKm = calcularDistanciaEstimadaMock(
                request.getCepOrigem(), request.getCepDestino());

        var tipoVeiculo = request.getTipoVeiculoCalculado();

        // Preço base por km (Moto: R$ 3,00/km, Carro: R$ 4,50/km)
        BigDecimal precoPorKm = tipoVeiculo.name().contains("MOTO")
                ? BigDecimal.valueOf(3.00)
                : BigDecimal.valueOf(4.50);

        // Tarifa base
        BigDecimal tarifaBase = tipoVeiculo.name().contains("MOTO")
                ? BigDecimal.valueOf(8.00)
                : BigDecimal.valueOf(12.00);

        // Valor da corrida Uber (sem margem)
        BigDecimal valorCorridaUber = tarifaBase
                .add(precoPorKm.multiply(BigDecimal.valueOf(distanciaEstimadaKm)))
                .setScale(2, RoundingMode.HALF_UP);

        // Taxa de comissão (configurável pelo admin)
        BigDecimal taxaComissaoPct = obterTaxaComissaoFrete(); // Ex: 10.00 = 10%
        BigDecimal taxaWin = valorCorridaUber
                .multiply(taxaComissaoPct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("MOCK - Taxa de comissão aplicada: {}% | Valor Uber: R$ {} | Comissão: R$ {}", 
                taxaComissaoPct, valorCorridaUber, taxaWin);

        // Valor total SEM arredondamento
        BigDecimal valorFreteExato = valorCorridaUber
                .add(taxaWin)
                .setScale(2, RoundingMode.HALF_UP);

        // ✅ ARREDONDAMENTO INTELIGENTE também no MOCK
        BigDecimal valorFreteTotal = aplicarArredondamentoInteligente(valorFreteExato);
        
        // Recalcular taxa Win
        taxaWin = valorFreteTotal.subtract(valorCorridaUber);

        // Tempo estimado (15 min base + 3 min por km)
        int tempoEstimado = (int) (15 + (distanciaEstimadaKm * 3));

        return SimulacaoFreteResponseDTO.builder()
                .sucesso(true)
                .quoteId("MOCK-QUOTE-" + UUID.randomUUID().toString().substring(0, 8)) // ✅ Quote ID mock
                .tipoVeiculo(tipoVeiculo)
                .valorCorridaUber(valorCorridaUber)
                .taxaWinmarket(taxaWin)
                .valorFreteTotal(valorFreteTotal)
                .valorOriginalCotado(valorFreteExato) // ✅ Valor antes do arredondamento
                .distanciaKm(distanciaEstimadaKm)
                .tempoEstimadoMinutos(tempoEstimado)
                .mensagem(String.format("Entrega expressa em até %d minutos (MOCK)", tempoEstimado))
                .build();
    }

    // ========================================
    // SOLICITAÇÃO DE ENTREGA
    // ========================================

    // ========================================
    // SOLICITAÇÃO DE ENTREGA
    // ========================================

    /**
     * Solicita uma entrega via Uber Direct.
     * 
     * @param request Dados da corrida (origem, destino, valores)
     * @return Resposta com dados do motorista e códigos
     */
    public SolicitacaoCorridaUberResponseDTO solicitarCorrida(SolicitacaoCorridaUberRequestDTO request) {
        log.info("Solicitando entrega Uber Direct - Pedido: {}, Veículo: {}",
                request.getPedidoId(), request.getTipoVeiculo());

        try {
            if (uberApiEnabled) {
                return solicitarCorridaApiReal(request);
            } else {
                log.info("Modo MOCK ativo - gerando entrega simulada");
                return solicitarCorridaMock(request);
            }
        } catch (Exception e) {
            log.error("Erro ao solicitar entrega Uber Direct", e);
            return SolicitacaoCorridaUberResponseDTO.builder()
                    .sucesso(false)
                    .erro("Erro ao solicitar corrida: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Solicitação real via API Uber Direct.
     * Endpoint: POST /v1/customers/{customer_id}/deliveries
     */
    private SolicitacaoCorridaUberResponseDTO solicitarCorridaApiReal(
            SolicitacaoCorridaUberRequestDTO request) {
        
        log.info("Criando entrega real via API Uber Direct - Quote ID: {}", request.getQuoteId());

        try {
            // Preparar body da requisição
            Map<String, Object> deliveryRequest = new HashMap<>();
            
            // ✅ QUOTE ID (garante preço cotado)
            if (request.getQuoteId() != null && !request.getQuoteId().isEmpty()) {
                deliveryRequest.put("quote_id", request.getQuoteId());
                log.debug("Usando Quote ID para garantir preço: {}", request.getQuoteId());
            } else {
                log.warn("Quote ID não fornecido - preço pode variar!");
            }
            
            // Informações de pickup (lojista)
            Map<String, Object> pickup = new HashMap<>();
            pickup.put("address", request.getEnderecoOrigemCompleto());
            
            // CEP separado (recomendado)
            if (request.getCepOrigem() != null) {
                pickup.put("postal_code", request.getCepOrigem());
            }
            
            // ✅ Adicionar lat/long se disponíveis (melhora precisão)
            if (request.getOrigemLatitude() != null && request.getOrigemLongitude() != null) {
                Map<String, Double> location = new HashMap<>();
                location.put("latitude", request.getOrigemLatitude());
                location.put("longitude", request.getOrigemLongitude());
                pickup.put("location", location);
                log.debug("Usando geolocalização de origem: {}, {}", 
                        request.getOrigemLatitude(), request.getOrigemLongitude());
            }
            
            // Contato de pickup (name, phone, email)
            Map<String, Object> pickupContact = new HashMap<>();
            pickupContact.put("name", request.getNomeLojista());
            
            Map<String, Object> pickupPhone = new HashMap<>();
            pickupPhone.put("number", limparTelefone(request.getTelefoneLojista()));
            pickupPhone.put("sms_enabled", true);
            pickupContact.put("phone", pickupPhone);
            
            if (request.getEmailLojista() != null && !request.getEmailLojista().isEmpty()) {
                pickupContact.put("email", request.getEmailLojista());
            }
            
            pickup.put("contact", pickupContact);
            
            // Instruções de retirada
            if (request.getInstrucoesRetirada() != null && !request.getInstrucoesRetirada().isEmpty()) {
                pickup.put("instructions", request.getInstrucoesRetirada());
            }
            
            deliveryRequest.put("pickup", pickup);
            
            // Informações de dropoff (cliente)
            Map<String, Object> dropoff = new HashMap<>();
            dropoff.put("address", request.getEnderecoDestinoCompleto());
            
            // CEP separado (recomendado)
            if (request.getCepDestino() != null) {
                dropoff.put("postal_code", request.getCepDestino());
            }
            
            // ✅ Adicionar lat/long de destino se disponíveis
            if (request.getDestinoLatitude() != null && request.getDestinoLongitude() != null) {
                Map<String, Double> location = new HashMap<>();
                location.put("latitude", request.getDestinoLatitude());
                location.put("longitude", request.getDestinoLongitude());
                dropoff.put("location", location);
                log.debug("Usando geolocalização de destino: {}, {}", 
                        request.getDestinoLatitude(), request.getDestinoLongitude());
            }
            
            // Contato de dropoff (name, phone, email)
            Map<String, Object> dropoffContact = new HashMap<>();
            dropoffContact.put("name", request.getNomeCliente());
            
            Map<String, Object> dropoffPhone = new HashMap<>();
            dropoffPhone.put("number", limparTelefone(request.getTelefoneCliente()));
            dropoffPhone.put("sms_enabled", true);
            dropoffContact.put("phone", dropoffPhone);
            
            if (request.getEmailCliente() != null && !request.getEmailCliente().isEmpty()) {
                dropoffContact.put("email", request.getEmailCliente());
            }
            
            dropoff.put("contact", dropoffContact);
            
            // Instruções de entrega
            if (request.getInstrucoesEntrega() != null && !request.getInstrucoesEntrega().isEmpty()) {
                dropoff.put("instructions", request.getInstrucoesEntrega());
            }
            
            deliveryRequest.put("dropoff", dropoff);
            
            // Tipo de veículo
            String vehicleType = request.getTipoVeiculo().name().contains("MOTO") 
                    ? "motorcycle" : "car";
            deliveryRequest.put("vehicle_type", vehicleType);
            
            // Detalhes da entrega (manifest)
            Map<String, Object> manifest = new HashMap<>();
            manifest.put("reference", request.getPedidoId().toString()); // ID do pedido
            String descricaoManifesto = "Pedido Win Marketplace #" +
                    request.getPedidoId().toString().substring(0, 8);

            if (request.getObservacoes() != null && !request.getObservacoes().isBlank()) {
                descricaoManifesto = descricaoManifesto + " | " + request.getObservacoes();
            }

            manifest.put("description", descricaoManifesto);
            
            // Adicionar valor total do pedido (em centavos)
            if (request.getValorTotalPedido() != null) {
                int totalValueCents = request.getValorTotalPedido()
                        .multiply(BigDecimal.valueOf(100))
                        .intValue();
                manifest.put("total_value", totalValueCents);
            }
            
            deliveryRequest.put("manifest", manifest);
            
            // Ação padrão caso não seja possível entregar
            deliveryRequest.put("undeliverable_action", "return_to_sender");
            
            // ID externo (nosso pedido)
            deliveryRequest.put("external_id", request.getPedidoId().toString());
            
            // ID da loja (external_store_id)
            if (request.getLojistaId() != null) {
                deliveryRequest.put("external_store_id", request.getLojistaId().toString());
            }

            // Fazer requisição
            HttpHeaders headers = criarHeadersAutenticados();
            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(deliveryRequest, headers);
            
            String deliveryUrl = uberApiBaseUrl + "/v1/customers/me/deliveries";
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    deliveryUrl, httpRequest, JsonNode.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return processarRespostaEntrega(response.getBody());
            } else {
                throw new RuntimeException("Resposta inválida da API Uber: " + 
                        response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            log.error("Erro HTTP ao criar entrega na Uber: {} - {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Erro ao criar entrega: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao criar entrega via Uber API", e);
            throw new RuntimeException("Erro na solicitação: " + e.getMessage(), e);
        }
    }

    /**
     * Processa resposta da criação de entrega e monta DTO.
     */
    private SolicitacaoCorridaUberResponseDTO processarRespostaEntrega(JsonNode responseBody) {
        try {
            // ID da entrega na Uber
            String deliveryId = responseBody.get("id").asText();
            
            // Status inicial
            String status = responseBody.get("status").asText();
            
            // URL de rastreamento
            String trackingUrl = responseBody.has("tracking_url") 
                    ? responseBody.get("tracking_url").asText()
                    : "https://m.uber.com/looking?id=" + deliveryId;
            
            // Códigos de verificação
            JsonNode verification = responseBody.get("verification");
            String pickupCode = verification != null && verification.has("pickup") 
                    ? verification.get("pickup").asText() 
                    : gerarCodigoAleatorio();
            String dropoffCode = verification != null && verification.has("dropoff")
                    ? verification.get("dropoff").asText()
                    : gerarCodigoAleatorio();
            
            // Informações do motorista (podem não estar disponíveis imediatamente)
            String courierName = null;
            String courierPhone = null;
            String vehiclePlate = null;
            
            if (responseBody.has("courier")) {
                JsonNode courier = responseBody.get("courier");
                courierName = courier.has("name") ? courier.get("name").asText() : null;
                courierPhone = courier.has("phone") ? courier.get("phone").asText() : null;
                
                if (courier.has("vehicle")) {
                    JsonNode vehicle = courier.get("vehicle");
                    vehiclePlate = vehicle.has("license_plate") 
                            ? vehicle.get("license_plate").asText() : null;
                }
            }
            
            log.info("Entrega criada com sucesso - ID: {}, Status: {}", deliveryId, status);
            
            return SolicitacaoCorridaUberResponseDTO.builder()
                    .sucesso(true)
                    .idCorridaUber(deliveryId)
                    .nomeMotorista(courierName)
                    .placaVeiculo(vehiclePlate)
                    .contatoMotorista(courierPhone)
                    .codigoRetirada(pickupCode)
                    .codigoEntrega(dropoffCode)
                    .urlRastreamento(trackingUrl)
                    .dataHoraSolicitacao(OffsetDateTime.now())
                    .tempoEstimadoRetiradaMinutos(15) // Estimativa padrão
                    .mensagem("Entrega solicitada com sucesso! " +
                            (courierName != null ? "Motorista: " + courierName : 
                            "Aguardando motorista aceitar"))
                    .build();
                    
        } catch (Exception e) {
            log.error("Erro ao processar resposta da entrega Uber", e);
            throw new RuntimeException("Erro ao processar resposta: " + e.getMessage(), e);
        }
    }

    /**
     * Solicitação MOCK de corrida (para desenvolvimento/testes).
     * Usado quando uber.api.enabled=false.
     */
    private SolicitacaoCorridaUberResponseDTO solicitarCorridaMock(SolicitacaoCorridaUberRequestDTO request) {
        log.debug("Executando solicitação MOCK de entrega - Quote ID: {}", request.getQuoteId());
        
        // Simular delay de processamento (200-500ms)
        try {
            Thread.sleep((long) (Math.random() * 300 + 200));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Gerar IDs e códigos fictícios
        String idCorridaUber = "UBER-MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String codigoRetirada = gerarCodigoAleatorio();
        String codigoEntrega = gerarCodigoAleatorio();

        // Motorista fictício
        String[] nomes = {"Carlos Silva", "João Santos", "Maria Oliveira", "Pedro Costa"};
        String nomeMotorista = nomes[(int) (Math.random() * nomes.length)];
        String placa = String.format("ABC-%04d", (int) (Math.random() * 10000));

        return SolicitacaoCorridaUberResponseDTO.builder()
                .sucesso(true)
                .idCorridaUber(idCorridaUber)
                .nomeMotorista(nomeMotorista)
                .placaVeiculo(placa)
                .contatoMotorista("(11) 9" + String.format("%08d", (int) (Math.random() * 100000000)))
                .codigoRetirada(codigoRetirada)
                .codigoEntrega(codigoEntrega)
                .urlRastreamento("https://m.uber.com/looking?ride=" + idCorridaUber)
                .dataHoraSolicitacao(OffsetDateTime.now())
                .tempoEstimadoRetiradaMinutos((int) (10 + Math.random() * 20))
                .mensagem("Motorista a caminho! Previsão de chegada: 10-15 minutos (MOCK)")
                .build();
    }

    // ========================================
    // CANCELAMENTO DE ENTREGA
    // ========================================

    // ========================================
    // CANCELAMENTO DE ENTREGA
    // ========================================

    /**
     * Cancela uma entrega Uber Direct.
     * 
     * @param idCorridaUber ID da corrida na Uber
     * @return true se cancelada com sucesso
     */
    public boolean cancelarCorrida(String idCorridaUber) {
        log.info("Cancelando entrega Uber Direct: {}", idCorridaUber);

        try {
            if (uberApiEnabled) {
                return cancelarCorridaApiReal(idCorridaUber);
            } else {
                log.info("Modo MOCK ativo - cancelamento simulado");
                return cancelarCorridaMock(idCorridaUber);
            }
        } catch (Exception e) {
            log.error("Erro ao cancelar entrega Uber Direct: {}", idCorridaUber, e);
            return false;
        }
    }

    /**
     * Cancelamento real via API Uber Direct.
     * Endpoint: POST /v1/customers/{customer_id}/deliveries/{delivery_id}/cancel
     */
    private boolean cancelarCorridaApiReal(String idCorridaUber) {
        log.info("Cancelando entrega real via API Uber Direct: {}", idCorridaUber);

        try {
            HttpHeaders headers = criarHeadersAutenticados();
            @SuppressWarnings("null")
            HttpEntity<Void> httpRequest = new HttpEntity<>(headers);
            
            String cancelUrl = uberApiBaseUrl + "/v1/customers/me/deliveries/" + 
                    idCorridaUber + "/cancel";
            
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    cancelUrl, httpRequest, JsonNode.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Entrega {} cancelada com sucesso na Uber", idCorridaUber);
                return true;
            } else {
                log.warn("Resposta inesperada ao cancelar entrega: {}", response.getStatusCode());
                return false;
            }
            
        } catch (HttpClientErrorException e) {
            // Se 404, entrega não existe ou já foi cancelada
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Entrega {} não encontrada na Uber (já cancelada?)", idCorridaUber);
                return true; // Considerar sucesso pois não existe mais
            }
            
            log.error("Erro HTTP ao cancelar entrega na Uber: {} - {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Erro inesperado ao cancelar entrega", e);
            return false;
        }
    }

    /**
     * Cancelamento MOCK (para desenvolvimento/testes).
     */
    private boolean cancelarCorridaMock(String idCorridaUber) {
        log.debug("Mock: Entrega {} cancelada com sucesso", idCorridaUber);
        return true;
    }

    // ========================================
    // CONSULTAR STATUS DA ENTREGA
    // ========================================

    /**
     * Consulta o status atualizado de uma entrega Uber Direct.
     * Retorna informações em tempo real sobre motorista, localização e ETAs.
     * 
     * @param idCorridaUber ID da corrida na Uber
     * @return Status atualizado da entrega
     */
    public DeliveryStatusResponseDTO consultarStatusEntrega(String idCorridaUber) {
        log.info("Consultando status da entrega Uber Direct: {}", idCorridaUber);

        try {
            if (uberApiEnabled) {
                return consultarStatusApiReal(idCorridaUber);
            } else {
                log.info("Modo MOCK ativo - retornando status simulado");
                return consultarStatusMock(idCorridaUber);
            }
        } catch (Exception e) {
            log.error("Erro ao consultar status da entrega: {}", idCorridaUber, e);
            return DeliveryStatusResponseDTO.builder()
                    .deliveryId(idCorridaUber)
                    .status("unknown")
                    .build();
        }
    }

    /**
     * Consulta real via API Uber Direct.
     * Endpoint: GET /v1/customers/me/deliveries/{delivery_id}
     */
    private DeliveryStatusResponseDTO consultarStatusApiReal(String idCorridaUber) {
        log.info("Consultando status real via API Uber Direct: {}", idCorridaUber);

        try {
            HttpHeaders headers = criarHeadersAutenticados();
            HttpEntity<Void> httpRequest = new HttpEntity<>(headers);
            
            String statusUrl = uberApiBaseUrl + "/v1/customers/me/deliveries/" + idCorridaUber;
            
            @SuppressWarnings("null")
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    statusUrl, HttpMethod.GET, httpRequest, JsonNode.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return processarRespostaStatus(response.getBody());
            } else {
                log.warn("Resposta inesperada ao consultar status: {}", response.getStatusCode());
                return DeliveryStatusResponseDTO.builder()
                        .deliveryId(idCorridaUber)
                        .status("unknown")
                        .build();
            }
            
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.warn("Entrega {} não encontrada na Uber", idCorridaUber);
                return DeliveryStatusResponseDTO.builder()
                        .deliveryId(idCorridaUber)
                        .status("not_found")
                        .build();
            }
            
            log.error("Erro HTTP ao consultar status na Uber: {} - {}", 
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Erro ao consultar status: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro inesperado ao consultar status", e);
            throw new RuntimeException("Erro na consulta: " + e.getMessage(), e);
        }
    }

    /**
     * Processa resposta da consulta de status e monta DTO.
     */
    private DeliveryStatusResponseDTO processarRespostaStatus(JsonNode responseBody) {
        try {
            String deliveryId = responseBody.get("id").asText();
            String status = responseBody.get("status").asText();
            String trackingUrl = responseBody.has("tracking_url") 
                    ? responseBody.get("tracking_url").asText() : null;
            
            Instant updatedAt = responseBody.has("updated_at")
                    ? Instant.parse(responseBody.get("updated_at").asText())
                    : Instant.now();
            
            // Processar informações do motorista
            DeliveryStatusResponseDTO.CourierInfo courierInfo = null;
            if (responseBody.has("courier")) {
                JsonNode courier = responseBody.get("courier");
                
                DeliveryStatusResponseDTO.VehicleInfo vehicleInfo = null;
                if (courier.has("vehicle")) {
                    JsonNode vehicle = courier.get("vehicle");
                    vehicleInfo = DeliveryStatusResponseDTO.VehicleInfo.builder()
                            .make(vehicle.has("make") ? vehicle.get("make").asText() : null)
                            .model(vehicle.has("model") ? vehicle.get("model").asText() : null)
                            .licensePlate(vehicle.has("license_plate") ? vehicle.get("license_plate").asText() : null)
                            .color(vehicle.has("color") ? vehicle.get("color").asText() : null)
                            .build();
                }
                
                Double latitude = null;
                Double longitude = null;
                Integer bearing = null;
                
                if (courier.has("location")) {
                    JsonNode location = courier.get("location");
                    latitude = location.has("latitude") ? location.get("latitude").asDouble() : null;
                    longitude = location.has("longitude") ? location.get("longitude").asDouble() : null;
                    bearing = location.has("bearing") ? location.get("bearing").asInt() : null;
                }
                
                courierInfo = DeliveryStatusResponseDTO.CourierInfo.builder()
                        .name(courier.has("name") ? courier.get("name").asText() : null)
                        .phoneNumber(courier.has("phone_number") ? courier.get("phone_number").asText() : null)
                        .latitude(latitude)
                        .longitude(longitude)
                        .bearing(bearing)
                        .vehicle(vehicleInfo)
                        .build();
            }
            
            // Processar informações de pickup
            DeliveryStatusResponseDTO.LocationInfo pickupInfo = null;
            if (responseBody.has("pickup")) {
                JsonNode pickup = responseBody.get("pickup");
                
                Instant pickupEta = pickup.has("eta") 
                        ? Instant.parse(pickup.get("eta").asText()) : null;
                
                String verificationCode = null;
                Boolean verified = null;
                
                if (pickup.has("verification")) {
                    JsonNode verification = pickup.get("verification");
                    verificationCode = verification.has("code") ? verification.get("code").asText() : null;
                    verified = verification.has("verified") ? verification.get("verified").asBoolean() : null;
                }
                
                pickupInfo = DeliveryStatusResponseDTO.LocationInfo.builder()
                        .eta(pickupEta)
                        .verificationCode(verificationCode)
                        .verified(verified)
                        .build();
            }
            
            // Processar informações de dropoff
            DeliveryStatusResponseDTO.LocationInfo dropoffInfo = null;
            if (responseBody.has("dropoff")) {
                JsonNode dropoff = responseBody.get("dropoff");
                
                Instant dropoffEta = dropoff.has("eta") 
                        ? Instant.parse(dropoff.get("eta").asText()) : null;
                
                String verificationCode = null;
                Boolean verified = null;
                
                if (dropoff.has("verification")) {
                    JsonNode verification = dropoff.get("verification");
                    verificationCode = verification.has("code") ? verification.get("code").asText() : null;
                    verified = verification.has("verified") ? verification.get("verified").asBoolean() : null;
                }
                
                dropoffInfo = DeliveryStatusResponseDTO.LocationInfo.builder()
                        .eta(dropoffEta)
                        .verificationCode(verificationCode)
                        .verified(verified)
                        .build();
            }
            
            log.info("Status consultado - ID: {}, Status: {}, Motorista: {}", 
                    deliveryId, status, courierInfo != null ? courierInfo.getName() : "N/A");
            
            return DeliveryStatusResponseDTO.builder()
                    .deliveryId(deliveryId)
                    .status(status)
                    .trackingUrl(trackingUrl)
                    .courier(courierInfo)
                    .pickup(pickupInfo)
                    .dropoff(dropoffInfo)
                    .updatedAt(updatedAt)
                    .build();
                    
        } catch (Exception e) {
            log.error("Erro ao processar resposta de status da Uber", e);
            throw new RuntimeException("Erro ao processar status: " + e.getMessage(), e);
        }
    }

    /**
     * Consulta MOCK de status (para desenvolvimento/testes).
     */
    private DeliveryStatusResponseDTO consultarStatusMock(String idCorridaUber) {
        log.debug("Mock: Consultando status da entrega {}", idCorridaUber);
        
        // Simular status baseado no tempo (para testes)
        String[] statuses = {"pending", "pickup", "pickup_complete", "dropoff", "delivered"};
        String status = statuses[(int) (Math.random() * statuses.length)];
        
        // Motorista fictício
        DeliveryStatusResponseDTO.VehicleInfo vehicle = DeliveryStatusResponseDTO.VehicleInfo.builder()
                .make("Honda")
                .model("CG 160")
                .licensePlate(String.format("ABC-%04d", (int) (Math.random() * 10000)))
                .color("Preta")
                .build();
        
        DeliveryStatusResponseDTO.CourierInfo courier = DeliveryStatusResponseDTO.CourierInfo.builder()
                .name("Carlos Silva (MOCK)")
                .phoneNumber("+5511998877665")
                .latitude(-23.550520 + (Math.random() * 0.01))
                .longitude(-46.633309 + (Math.random() * 0.01))
                .bearing((int) (Math.random() * 360))
                .vehicle(vehicle)
                .build();
        
        // Informações de pickup
        DeliveryStatusResponseDTO.LocationInfo pickup = DeliveryStatusResponseDTO.LocationInfo.builder()
                .eta(Instant.now().plusSeconds(600)) // 10 minutos
                .verificationCode("1234")
                .verified(status.equals("pickup_complete") || status.equals("dropoff") || status.equals("delivered"))
                .build();
        
        // Informações de dropoff
        DeliveryStatusResponseDTO.LocationInfo dropoff = DeliveryStatusResponseDTO.LocationInfo.builder()
                .eta(Instant.now().plusSeconds(1800)) // 30 minutos
                .verificationCode("5678")
                .verified(status.equals("delivered"))
                .build();
        
        return DeliveryStatusResponseDTO.builder()
                .deliveryId(idCorridaUber)
                .status(status)
                .trackingUrl("https://m.uber.com/looking?ride=" + idCorridaUber)
                .courier(courier)
                .pickup(pickup)
                .dropoff(dropoff)
                .updatedAt(Instant.now())
                .build();
    }

    // ========================================
    // MÉTODOS AUXILIARES
    // ========================================

    /**
     * Remove formatação de telefone, mantendo apenas números.
     * Adiciona código do país +55 se necessário.
     */
    private String limparTelefone(String telefone) {
        if (telefone == null || telefone.isEmpty()) {
            return "";
        }
        
        String cleaned = telefone.replaceAll("\\D", "");
        
        // Adicionar +55 se não tiver código do país
        if (cleaned.length() == 11 && !cleaned.startsWith("55")) {
            cleaned = "55" + cleaned;
        }
        
        return "+" + cleaned;
    }

    /**
     * Gera código de verificação aleatório de 4 dígitos.
     */
    private String gerarCodigoAleatorio() {
        return String.format("%04d", (int) (Math.random() * 10000));
    }

    /**
     * Calcula distância estimada entre dois CEPs (mock simples).
     * NOTA: Em produção, a distância vem da própria API Uber.
     */
    private double calcularDistanciaEstimadaMock(String cepOrigem, String cepDestino) {
        try {
            int cep1 = Integer.parseInt(cepOrigem.replaceAll("\\D", ""));
            int cep2 = Integer.parseInt(cepDestino.replaceAll("\\D", ""));
            double diferencaCep = Math.abs(cep1 - cep2);
            
            // Estima ~5-20km para CEPs na mesma região
            return 5.0 + (diferencaCep % 15) + (Math.random() * 5);
        } catch (Exception e) {
            log.warn("Erro ao calcular distância estimada, usando padrão 10km", e);
            return 10.0;
        }
    }
}
