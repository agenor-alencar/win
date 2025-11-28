package com.win.marketplace.service;

import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.request.SolicitacaoCorridaUberRequestDTO;
import com.win.marketplace.dto.response.SimulacaoFreteResponseDTO;
import com.win.marketplace.dto.response.SolicitacaoCorridaUberResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service responsável pela integração com a API Uber Flash.
 * 
 * IMPORTANTE: Esta é uma implementação MOCK para desenvolvimento.
 * Em produção, deve-se integrar com a API real da Uber Flash:
 * - Documentação: https://developer.uber.com/
 * - Endpoints de simulação, solicitação, cancelamento e webhooks
 * - Autenticação via OAuth 2.0
 * - Headers de segurança e rate limiting
 * 
 * TODO: Implementar integração real com Uber Flash API quando disponível
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UberFlashService {

    private final RestTemplate restTemplate;

    @Value("${uber.api.base-url:https://api.uber.com}")
    private String uberApiBaseUrl;

    @Value("${uber.api.client-id:}")
    private String uberClientId;

    @Value("${uber.api.client-secret:}")
    private String uberClientSecret;

    @Value("${uber.api.enabled:false}")
    private Boolean uberApiEnabled;

    // ========================================
    // Simulação de Frete
    // ========================================

    /**
     * Simula o custo de uma corrida Uber Flash.
     * 
     * @param request Dados para simulação (origem, destino, peso)
     * @return Simulação com valores calculados
     */
    public SimulacaoFreteResponseDTO simularFrete(SimulacaoFreteRequestDTO request) {
        log.info("Simulando frete Uber Flash - Origem: {}, Destino: {}, Peso: {}kg",
                request.getCepOrigem(), request.getCepDestino(), request.getPesoTotalKg());

        try {
            if (uberApiEnabled) {
                return simularFreteApiReal(request);
            } else {
                return simularFreteMock(request);
            }
        } catch (Exception e) {
            log.error("Erro ao simular frete Uber Flash", e);
            return SimulacaoFreteResponseDTO.builder()
                    .sucesso(false)
                    .erro("Erro ao simular frete: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Simulação MOCK de frete (para desenvolvimento/testes).
     */
    private SimulacaoFreteResponseDTO simularFreteMock(SimulacaoFreteRequestDTO request) {
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

        // Valor total para o cliente
        BigDecimal valorFreteTotal = valorCorridaUber
                .add(taxaWin)
                .setScale(2, RoundingMode.HALF_UP);

        // Tempo estimado (15 min base + 3 min por km)
        int tempoEstimado = (int) (15 + (distanciaEstimadaKm * 3));

        return SimulacaoFreteResponseDTO.builder()
                .sucesso(true)
                .tipoVeiculo(tipoVeiculo)
                .valorCorridaUber(valorCorridaUber)
                .taxaWinmarket(taxaWin)
                .valorFreteTotal(valorFreteTotal)
                .distanciaKm(distanciaEstimadaKm)
                .tempoEstimadoMinutos(tempoEstimado)
                .mensagem(String.format("Entrega expressa em até %d minutos", tempoEstimado))
                .build();
    }

    /**
     * Integração real com API Uber Flash (TODO: implementar).
     */
    private SimulacaoFreteResponseDTO simularFreteApiReal(SimulacaoFreteRequestDTO request) {
        // TODO: Implementar chamada real à API Uber
        // POST {uberApiBaseUrl}/v1/deliveries/quote
        // Headers: Authorization, Content-Type
        // Body: pickup_address, dropoff_address, vehicle_type
        
        log.warn("API Uber Flash não implementada, usando simulação mock");
        return simularFreteMock(request);
    }

    // ========================================
    // Solicitação de Corrida
    // ========================================

    /**
     * Solicita uma corrida Uber Flash.
     * 
     * @param request Dados da corrida (origem, destino, valores)
     * @return Resposta com dados do motorista e códigos
     */
    public SolicitacaoCorridaUberResponseDTO solicitarCorrida(SolicitacaoCorridaUberRequestDTO request) {
        log.info("Solicitando corrida Uber Flash - Pedido: {}, Veículo: {}",
                request.getPedidoId(), request.getTipoVeiculo());

        try {
            if (uberApiEnabled) {
                return solicitarCorridaApiReal(request);
            } else {
                return solicitarCorridaMock(request);
            }
        } catch (Exception e) {
            log.error("Erro ao solicitar corrida Uber Flash", e);
            return SolicitacaoCorridaUberResponseDTO.builder()
                    .sucesso(false)
                    .erro("Erro ao solicitar corrida: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Solicitação MOCK de corrida (para desenvolvimento/testes).
     */
    private SolicitacaoCorridaUberResponseDTO solicitarCorridaMock(SolicitacaoCorridaUberRequestDTO request) {
        // Gerar IDs e códigos fictícios
        String idCorridaUber = "UBER-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String codigoRetirada = String.format("%04d", (int) (Math.random() * 10000));
        String codigoEntrega = String.format("%04d", (int) (Math.random() * 10000));

        // Motorista fictício
        String[] nomes = {"Carlos Silva", "João Santos", "Maria Oliveira", "Pedro Costa"};
        String nomeMotorista = nomes[(int) (Math.random() * nomes.length)];
        String placa = String.format("ABC-%04d", (int) (Math.random() * 10000));

        return SolicitacaoCorridaUberResponseDTO.builder()
                .sucesso(true)
                .idCorridaUber(idCorridaUber)
                .nomeMotorista(nomeMotorista)
                .placaVeiculo(placa)
                .contatoMotorista("(11) 9" + (int) (Math.random() * 100000000))
                .codigoRetirada(codigoRetirada)
                .codigoEntrega(codigoEntrega)
                .urlRastreamento("https://m.uber.com/looking?ride=" + idCorridaUber)
                .dataHoraSolicitacao(OffsetDateTime.now())
                .tempoEstimadoRetiradaMinutos((int) (10 + Math.random() * 20))
                .mensagem("Motorista a caminho! Previsão de chegada: 10-15 minutos")
                .build();
    }

    /**
     * Integração real com API Uber Flash (TODO: implementar).
     */
    private SolicitacaoCorridaUberResponseDTO solicitarCorridaApiReal(SolicitacaoCorridaUberRequestDTO request) {
        // TODO: Implementar chamada real à API Uber
        // POST {uberApiBaseUrl}/v1/deliveries
        // Headers: Authorization, Content-Type
        // Body: pickup, dropoff, vehicle_type, customer_info
        
        log.warn("API Uber Flash não implementada, usando solicitação mock");
        return solicitarCorridaMock(request);
    }

    // ========================================
    // Cancelamento de Corrida
    // ========================================

    /**
     * Cancela uma corrida Uber Flash.
     * 
     * @param idCorridaUber ID da corrida na Uber
     * @return true se cancelada com sucesso
     */
    public boolean cancelarCorrida(String idCorridaUber) {
        log.info("Cancelando corrida Uber Flash: {}", idCorridaUber);

        try {
            if (uberApiEnabled) {
                return cancelarCorridaApiReal(idCorridaUber);
            } else {
                return cancelarCorridaMock(idCorridaUber);
            }
        } catch (Exception e) {
            log.error("Erro ao cancelar corrida Uber Flash: {}", idCorridaUber, e);
            return false;
        }
    }

    /**
     * Cancelamento MOCK (para desenvolvimento/testes).
     */
    private boolean cancelarCorridaMock(String idCorridaUber) {
        log.info("Mock: Corrida {} cancelada com sucesso", idCorridaUber);
        return true;
    }

    /**
     * Integração real com API Uber Flash (TODO: implementar).
     */
    private boolean cancelarCorridaApiReal(String idCorridaUber) {
        // TODO: Implementar chamada real à API Uber
        // DELETE {uberApiBaseUrl}/v1/deliveries/{idCorridaUber}
        // Headers: Authorization
        
        log.warn("API Uber Flash não implementada, usando cancelamento mock");
        return cancelarCorridaMock(idCorridaUber);
    }

    // ========================================
    // Métodos Auxiliares
    // ========================================

    /**
     * Calcula distância estimada entre dois CEPs (mock simples).
     * Em produção, usar API de geolocalização real.
     */
    private double calcularDistanciaEstimadaMock(String cepOrigem, String cepDestino) {
        // Simulação simples: diferença entre CEPs + fator aleatório
        int cep1 = Integer.parseInt(cepOrigem.replaceAll("\\D", ""));
        int cep2 = Integer.parseInt(cepDestino.replaceAll("\\D", ""));
        double diferencaCep = Math.abs(cep1 - cep2);
        
        // Estima ~5-20km para CEPs na mesma região
        return 5.0 + (diferencaCep % 15) + (Math.random() * 5);
    }
}
