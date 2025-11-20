package com.win.marketplace.service;

import com.win.marketplace.dto.response.GtinDataResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Optional;

/**
 * Serviço para consulta de dados de produtos através do código GTIN/EAN
 * usando API externa (Cosmos API da Bluesoft).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GtinApiService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.gtin-api.url}")
    private String gtinApiUrl;

    @Value("${app.gtin-api.token:}")
    private String gtinApiToken;

    /**
     * Consulta dados logísticos de um produto através do código GTIN/EAN.
     * 
     * @param gtinEan Código GTIN/EAN do produto (8, 12, 13 ou 14 dígitos)
     * @return Optional contendo os dados do produto, ou empty se não encontrado
     */
    public Optional<GtinDataResponseDTO> consultarDadosLogisticos(String gtinEan) {
        if (gtinEan == null || gtinEan.trim().isEmpty()) {
            log.warn("GTIN/EAN vazio ou nulo fornecido");
            return Optional.empty();
        }

        // Validar formato do GTIN/EAN (apenas números)
        if (!gtinEan.matches("\\d{8,14}")) {
            log.warn("GTIN/EAN inválido: {}. Deve conter apenas números (8-14 dígitos)", gtinEan);
            return Optional.empty();
        }

        try {
            log.info("Consultando API GTIN para código: {}", gtinEan);

            WebClient webClient = webClientBuilder
                    .baseUrl(gtinApiUrl)
                    .build();

            GtinDataResponseDTO response = webClient
                    .get()
                    .uri("/{gtin}.json", gtinEan)
                    .headers(headers -> {
                        // Adicionar token de autenticação se configurado
                        if (gtinApiToken != null && !gtinApiToken.isEmpty()) {
                            headers.set("X-Cosmos-Token", gtinApiToken);
                        }
                    })
                    .retrieve()
                    .onStatus(
                        status -> status == HttpStatus.NOT_FOUND,
                        clientResponse -> {
                            log.warn("GTIN {} não encontrado na API", gtinEan);
                            return Mono.empty();
                        }
                    )
                    .onStatus(
                        status -> status.is4xxClientError(),
                        clientResponse -> {
                            log.error("Erro cliente ao consultar GTIN {}: {}", gtinEan, clientResponse.statusCode());
                            return Mono.empty();
                        }
                    )
                    .onStatus(
                        status -> status.is5xxServerError(),
                        clientResponse -> {
                            log.error("Erro servidor ao consultar GTIN {}: {}", gtinEan, clientResponse.statusCode());
                            return Mono.empty();
                        }
                    )
                    .bodyToMono(GtinDataResponseDTO.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            if (response != null) {
                log.info("Dados encontrados para GTIN {}: {} - {}", gtinEan, response.descricao(), response.marca());
                return Optional.of(response);
            }

            log.warn("Resposta vazia da API para GTIN {}", gtinEan);
            return Optional.empty();

        } catch (Exception e) {
            log.error("Erro ao consultar API GTIN para código {}: {}", gtinEan, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * Valida se um código GTIN/EAN é válido (formato básico).
     * 
     * @param gtinEan Código a validar
     * @return true se o formato é válido
     */
    public boolean isGtinValido(String gtinEan) {
        return gtinEan != null && gtinEan.matches("\\d{8,14}");
    }
}
