package com.win.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.request.SolicitacaoCorridaUberRequestDTO;
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
            headers.setBasicAuth(uberClientId, uberClientSecret);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("scope", "eats.deliveries");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            // Fazer requisição
            String tokenUrl = "https://login.uber.com/oauth/v2/token";
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    tokenUrl, request, JsonNode.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode responseBody = response.getBody();
                
                // Extrair token e tempo de expiração
                cachedAccessToken = responseBody.get("access_token").asText();
                int expiresIn = responseBody.get("expires_in").asInt();
                
                // Renovar token 5 minutos antes de expirar
                tokenExpiresAt = Instant.now().plusSeconds(expiresIn - 300);
                
                log.info("Access token obtido com sucesso. Expira em {} segundos", expiresIn);
                return cachedAccessToken;
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
    }

    /**
     * Cria headers padrão para requisições à API Uber.
     */
    private HttpHeaders criarHeadersAutenticados() {
        String token = obterAccessToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        headers.set("Accept", "application/json");
        
        return headers;
    }

    // ========================================
    // COTAÇÃO DE FRETE (QUOTE)
    // ========================================

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
                return simularFreteApiReal(request);
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

            // 3. PREPARAR REQUEST PARA UBER API
            // Preparar body da requisição
            Map<String, Object> quoteRequest = new HashMap<>();
            
            // Endereço de origem (lojista) com coordenadas
            Map<String, Object> pickup = new HashMap<>();
            pickup.put("address", request.getEnderecoOrigemCompleto());
            pickup.put("postal_code", request.getCepOrigem());
            pickup.put("latitude", request.getOrigemLatitude());
            pickup.put("longitude", request.getOrigemLongitude());
            quoteRequest.put("pickup", pickup);
            
            // Endereço de destino (cliente) com coordenadas
            Map<String, Object> dropoff = new HashMap<>();
            dropoff.put("address", request.getEnderecoDestinoCompleto());
            dropoff.put("postal_code", request.getCepDestino());
            dropoff.put("latitude", request.getDestinoLatitude());
            dropoff.put("longitude", request.getDestinoLongitude());
            quoteRequest.put("dropoff", dropoff);
            
            // Tipo de veículo baseado no peso
            var tipoVeiculo = request.getTipoVeiculoCalculado();
            String vehicleType = tipoVeiculo.name().contains("MOTO") ? "motorcycle" : "car";
            quoteRequest.put("vehicle_type", vehicleType);

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
            
            // Taxa Win (10%)
            BigDecimal taxaWin = valorCorridaUber
                    .multiply(BigDecimal.valueOf(0.10))
                    .setScale(2, RoundingMode.HALF_UP);
            
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
     * Regra: Valores sempre terminam em X,90 ou X,00
     * 
     * Exemplos:
     * - R$ 17,43 → R$ 17,90
     * - R$ 15,00 → R$ 15,00 (já termina em 0)
     * - R$ 22,78 → R$ 22,90
     * - R$ 30,10 → R$ 30,90
     * 
     * Benefícios:
     * 1. Valores mais "redondos" para o cliente
     * 2. Margem de segurança para variações de preço
     * 3. Cobre possíveis flutuações da API Uber
     */
    private BigDecimal aplicarArredondamentoInteligente(BigDecimal valorExato) {
        // Pegar parte decimal
        BigDecimal parteInteira = valorExato.setScale(0, RoundingMode.DOWN);
        BigDecimal parteDecimal = valorExato.subtract(parteInteira);
        
        // Se já termina em X,00, retornar como está
        if (parteDecimal.compareTo(BigDecimal.ZERO) == 0) {
            return valorExato;
        }
        
        // Caso contrário, arredondar para X,90
        BigDecimal valorArredondado = parteInteira.add(BigDecimal.valueOf(0.90));
        
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

        // Taxa Win (10%)
        BigDecimal taxaWin = valorCorridaUber
                .multiply(BigDecimal.valueOf(0.10))
                .setScale(2, RoundingMode.HALF_UP);

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
            pickup.put("name", request.getNomeLojista());
            pickup.put("phone_number", limparTelefone(request.getTelefoneLojista()));
            
            // ✅ Adicionar lat/long se disponíveis (melhora precisão)
            if (request.getOrigemLatitude() != null && request.getOrigemLongitude() != null) {
                Map<String, Double> location = new HashMap<>();
                location.put("latitude", request.getOrigemLatitude());
                location.put("longitude", request.getOrigemLongitude());
                pickup.put("location", location);
                log.debug("Usando geolocalização de origem: {}, {}", 
                        request.getOrigemLatitude(), request.getOrigemLongitude());
            }
            deliveryRequest.put("pickup", pickup);
            
            // Informações de dropoff (cliente)
            Map<String, Object> dropoff = new HashMap<>();
            dropoff.put("address", request.getEnderecoDestinoCompleto());
            dropoff.put("name", request.getNomeCliente());
            dropoff.put("phone_number", limparTelefone(request.getTelefoneCliente()));
            
            // ✅ Adicionar lat/long de destino se disponíveis
            if (request.getDestinoLatitude() != null && request.getDestinoLongitude() != null) {
                Map<String, Double> location = new HashMap<>();
                location.put("latitude", request.getDestinoLatitude());
                location.put("longitude", request.getDestinoLongitude());
                dropoff.put("location", location);
                log.debug("Usando geolocalização de destino: {}, {}", 
                        request.getDestinoLatitude(), request.getDestinoLongitude());
            }
            
            deliveryRequest.put("dropoff", dropoff);
            
            // Tipo de veículo
            String vehicleType = request.getTipoVeiculo().name().contains("MOTO") 
                    ? "motorcycle" : "car";
            deliveryRequest.put("vehicle_type", vehicleType);
            
            // Detalhes da entrega
            Map<String, Object> manifest = new HashMap<>();
            manifest.put("description", "Pedido Win Marketplace #" + 
                    request.getPedidoId().toString().substring(0, 8));
            deliveryRequest.put("manifest", manifest);
            
            // ID externo (nosso pedido)
            deliveryRequest.put("external_id", request.getPedidoId().toString());

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
