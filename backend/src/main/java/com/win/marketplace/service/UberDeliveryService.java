package com.win.marketplace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.win.marketplace.dto.request.UberDeliveryRequestDTO;
import com.win.marketplace.dto.response.UberDeliveryResponseDTO;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.repository.EntregaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Serviço para integração com Uber Direct - Create Delivery API
 * 
 * Responsabilidades:
 * - Confirmar entrega à Uber usando quote_id
 * - Obter delivery_id e URL de rastreamento
 * - Armazenar informações no banco de dados
 * - Gerar PIN codes para confirmação (lojista + cliente)
 * - Atualizar status do pedido
 * 
 * Fluxo:
 * 1. Lojista clica "Pronto para Retirada"
 * 2. Sistema chama este serviço com dados do pedido
 * 3. Uber retorna delivery_id e tracking_url
 * 4. Sistema armazena em banco e atualiza status
 * 5. Motorista recebe order
 * 6. Sistema valida PIN codes na coleta/entrega (Step 5 - Webhooks)
 * 
 * ⚠️ PIN codes são OBRIGATÓRIOS para:
 * - Pickup: Lojista confirma coleta (previne roubo)
 * - Delivery: Cliente confirma entrega (prova de entrega)
 * 
 * @author WinMarketplace Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UberDeliveryService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final UberAuthService uberAuthService;
    private final EntregaRepository entregaRepository;

    @Value("${app.uber.direct.api-base-url:https://api.uber.com/v1/customers}")
    private String uberApiBaseUrl;

    @Value("${app.uber.direct.customer-id}")
    private String customerId;

    /**
     * Confirma uma entrega na Uber Direct
     * 
     * Endpoint: POST {api-base-url}/{customer_id}/deliveries
     * 
     * Fluxo:
     * 1. Validar dados de entrada
     * 2. Gerar PIN codes (se não fornecidos)
     * 3. Chamar API da Uber
     * 4. Salvar informações no banco de dados
     * 5. Retornar tracking_url para cliente
     * 
     * @param request DTO com detalhes da entrega e PIN codes obrigatórios
     * @param pedidoId ID do pedido (para vincular no banco)
     * @return Resposta com delivery_id, tracking_url e status
     * @throws RuntimeException Se houver erro
     */
    public UberDeliveryResponseDTO criarEntrega(UberDeliveryRequestDTO request, UUID pedidoId) {
        try {
            log.info("🚚 Criando entrega via Uber para pedido: {}", request.getPedidoId());
            log.debug("   Quote ID: {}", request.getQuoteId());
            log.debug("   PIN Coleta: {}", request.getPinColeta());
            log.debug("   PIN Entrega: {}", request.getPinEntrega());

            // 1. Validar PIN codes (obrigatórios)
            validarPinCodes(request);

            // 2. Obter token OAuth
            String accessToken = uberAuthService.obterAccessToken();
            
            // 3. Preparar headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("User-Agent", "WinMarketplace/2.0");

            // 4. Construir URL
            String url = String.format("%s/%s/deliveries", uberApiBaseUrl, customerId);
            log.debug("📡 URL: {}", url);

            // 5. Preparar corpo (limpar PINs antes de enviar - serão inclusos no payload)
            String requestBody = objectMapper.writeValueAsString(request);
            log.debug("📦 Request: {}", requestBody);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // 6. Fazer requisição
            log.info("🚀 Enviando Create Delivery request para Uber...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            // 7. Validar resposta
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                log.error("❌ Erro - Status: {}", response.getStatusCode());
                throw new RuntimeException("Falha ao criar entrega - Status: " + response.getStatusCode());
            }

            // 8. Parse da resposta
            UberDeliveryResponseDTO delivery = objectMapper.readValue(
                    response.getBody(),
                    UberDeliveryResponseDTO.class
            );

            log.info("✅ Entrega criada com sucesso!");
            log.info("   Delivery ID: {}", delivery.getDeliveryId());
            log.info("   Status: {}", delivery.getStatus());
            log.info("   Tracking URL: {}", delivery.getUrlRastreamento());

            // 9. Salvar no banco de dados
            salvarEntregaNoDb(pedidoId, request, delivery);

            return delivery;

        } catch (RuntimeException e) {
            log.error("❌ Erro: {}", e.getMessage());
            throw e;
        } catch (RestClientException e) {
            log.error("❌ Erro de conexão: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao conectar na API da Uber: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Erro ao processar: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao criar entrega: " + e.getMessage(), e);
        }
    }

    /**
     * Valida PIN codes obrigatórios
     */
    private void validarPinCodes(UberDeliveryRequestDTO request) {
        if (request.getPinColeta() == null || request.getPinColeta().isEmpty()) {
            throw new RuntimeException("PIN de coleta é obrigatório");
        }
        if (request.getPinEntrega() == null || request.getPinEntrega().isEmpty()) {
            throw new RuntimeException("PIN de entrega é obrigatório");
        }
        
        // Validar formato (4-6 dígitos)
        if (!request.getPinColeta().matches("\\d{4,6}")) {
            throw new RuntimeException("PIN de coleta deve conter 4-6 dígitos");
        }
        if (!request.getPinEntrega().matches("\\d{4,6}")) {
            throw new RuntimeException("PIN de entrega deve conter 4-6 dígitos");
        }
        
        log.info("✅ PIN codes validados");
    }

    /**
     * Salva informações da entrega no banco de dados
     * Atualiza ou cria registro de entrega (Entrega entity)
     */
    private void salvarEntregaNoDb(UUID pedidoId, UberDeliveryRequestDTO request, 
                                   UberDeliveryResponseDTO delivery) {
        try {
            // Buscar entrega existente
            Optional<Entrega> entregaOpt = entregaRepository.findByPedidoId(pedidoId);
            
            Entrega entrega = entregaOpt.orElseGet(Entrega::new);
            
            // Atualizar campos
            entrega.setIdCorridaUber(delivery.getDeliveryId());
            entrega.setUrlRastreamentoUber(delivery.getUrlRastreamento());
            entrega.setStatusEntrega(mapearStatusUber(delivery.getStatus()));
            entrega.setCodigoRetiradaUber(request.getPinColeta());
            entrega.setCodigoEntregaUber(request.getPinEntrega());
            entrega.setDataHoraSolicitacao(OffsetDateTime.now());
            entrega.setClienteNome(request.getNomeCliente());
            entrega.setClienteTelefone(request.getTelefoneCliente());
            entrega.setEnderecoEntrega(request.getEnderecoEntrega().getEndereco());
            entrega.setDestinoLatitude(request.getEnderecoEntrega().getLatitude());
            entrega.setDestinoLongitude(request.getEnderecoEntrega().getLongitude());
            entrega.setOrigemLatitude(request.getEnderecoColeta().getLatitude());
            entrega.setOrigemLongitude(request.getEnderecoColeta().getLongitude());
            entrega.setObservacoes(request.getNotasEntrega());
            
            Entrega entregaSalva = entregaRepository.save(entrega);
            log.info("✅ Entrega salva no DB - ID: {}", entregaSalva.getId());

        } catch (Exception e) {
            log.error("❌ Erro ao salvar entrega no DB: {}", e.getMessage(), e);
            // Não lançar exceção aqui - entrega foi criada na Uber mesmo que DB falhe
            log.warn("⚠️ Atenção: Entrega foi criada na Uber, mas pode haver inconsistência no DB");
        }
    }

    /**
     * Mapeia status da Uber para status interno
     * 
     * Mapeamento de status Uber Direct -> StatusEntrega:
     * SEARCHING_FOR_COURIER -> AGUARDANDO_MOTORISTA (procurando motorista)
     * ACCEPTED -> AGUARDANDO_MOTORISTA (motorista aceitou)
     * ARRIVED_AT_PICKUP -> MOTORISTA_A_CAMINHO_RETIRADA (motorista chegou na coleta)
     * PICKED_UP -> EM_TRANSITO (item coletado e em trânsito)
     * ARRIVED_AT_DROPOFF -> EM_TRANSITO (motorista chegou no destino)
     * DELIVERED -> ENTREGUE (entrega confirmada)
     * CANCELLED -> CANCELADA (entrega cancelada)
     */
    private com.win.marketplace.model.enums.StatusEntrega mapearStatusUber(String statusUber) {
        return switch (statusUber != null ? statusUber.toUpperCase() : "") {
            case "SEARCHING_FOR_COURIER" -> com.win.marketplace.model.enums.StatusEntrega.AGUARDANDO_MOTORISTA;
            case "ACCEPTED" -> com.win.marketplace.model.enums.StatusEntrega.AGUARDANDO_MOTORISTA;
            case "ARRIVED_AT_PICKUP" -> com.win.marketplace.model.enums.StatusEntrega.MOTORISTA_A_CAMINHO_RETIRADA;
            case "PICKED_UP" -> com.win.marketplace.model.enums.StatusEntrega.EM_TRANSITO;
            case "ARRIVED_AT_DROPOFF" -> com.win.marketplace.model.enums.StatusEntrega.EM_TRANSITO;
            case "DELIVERED" -> com.win.marketplace.model.enums.StatusEntrega.ENTREGUE;
            case "CANCELLED" -> com.win.marketplace.model.enums.StatusEntrega.CANCELADA;
            default -> com.win.marketplace.model.enums.StatusEntrega.FALHA_SOLICITACAO;
        };
    }

    /**
     * Gera um PIN code aleatório (4-6 dígitos)
     * Pode ser usado se não for fornecido pelo lojista
     */
    public String gerarPinCode() {
        int pinLength = 4 + new java.util.Random().nextInt(3); // 4, 5 ou 6
        int pin = 1000 + new java.util.Random().nextInt(9000); // 4 dígitos
        return String.format("%0" + pinLength + "d", pin);
    }

    /**
     * Obtém informações de uma entrega por ID
     */
    public UberDeliveryResponseDTO obterStatusEntrega(String deliveryId) {
        log.info("🔍 Buscando status de entrega: {}", deliveryId);
        
        try {
            String accessToken = uberAuthService.obterAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("User-Agent", "WinMarketplace/2.0");

            String url = String.format("%s/%s/deliveries/%s", uberApiBaseUrl, customerId, deliveryId);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readValue(response.getBody(), UberDeliveryResponseDTO.class);
            }
        } catch (Exception e) {
            log.error("❌ Erro ao buscar status: {}", e.getMessage());
        }
        
        return null;
    }
}
