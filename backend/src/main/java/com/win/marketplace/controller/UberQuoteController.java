package com.win.marketplace.controller;

import com.win.marketplace.dto.request.UberQuoteRequestDTO;
import com.win.marketplace.dto.response.UberQuoteResponseDTO;
import com.win.marketplace.service.UberQuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller para cotação de frete via Uber Direct
 * 
 * Endpoints:
 * - POST /api/v1/uber/quotes - Solicitar cotação
 * 
 * Fluxo:
 * 1. Cliente seleciona endereço de entrega
 * 2. Frontend chama geocoding para coordenadas
 * 3. Frontend chama este controller com as coordenadas
 * 4. Sistema retorna cotação com quote_id
 * 5. Cliente visualiza preço final (com taxa Win)
 * 6. Se confirmar, usa quote_id para efetivar entrega
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/uber/quotes")
@RequiredArgsConstructor
@Tag(name = "Uber Quotes", description = "APIs de Cotação de Frete via Uber Direct")
public class UberQuoteController {

    private final UberQuoteService uberQuoteService;

    /**
     * Solicita cotação de frete para um pedido
     * 
     * Requer:
     * - Localização de coleta (coordenadas do lojista)
     * - Localização de entrega (coordenadas do cliente)
     * - ID externo do pedido
     * 
     * Retorna:
     * - Quote ID para usar na confirmação de entrega
     * - Valor da cotação
     * - Tempo estimado de coleta
     * - Tempo estimado de entrega
     * 
     * @param request DTO com coordenadas e informações da entrega
     * @return Cotação com valor e quote_id
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Solicitar Cotação de Frete", 
               description = "Calcula valor de frete via Uber Direct para o pedido")
    public ResponseEntity<?> solicitarCotacao(@Valid @RequestBody UberQuoteRequestDTO request) {
        try {
            log.info("📦 POST /api/v1/uber/quotes - Cotação para pedido: {}", request.getExternalId());

            // Solicitar cotação à Uber
            UberQuoteResponseDTO cotacao = uberQuoteService.solicitarCotacao(request);

            // Calcular valores finais
            BigDecimal freteComTaxa = uberQuoteService.calcularFreteComTaxa(cotacao.getValor());
            BigDecimal margemWin = uberQuoteService.calcularMargemWin(cotacao.getValor());

            log.info("✅ Cotação calculada - Valor Uber: R${}, Com Taxa: R${}",
                     cotacao.getValor(), freteComTaxa);

            // Retornar resposta formatada
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("quote_id", cotacao.getQuoteId());
                put("valores", new HashMap<String, Object>() {{
                    put("valor_uber", cotacao.getValor());
                    put("taxa_win", margemWin);
                    put("frete_cliente", freteComTaxa);
                    put("moeda", cotacao.getMoeda());
                }});
                put("tempos_estimados", new HashMap<String, Object>() {{
                    put("coleta_segundos", cotacao.getTempoEstimadoColeta());
                    put("coleta_minutos", cotacao.getTempoEstimadoColeta() / 60);
                    put("entrega_segundos", cotacao.getTempoEstimadoEntrega());
                    put("entrega_minutos", cotacao.getTempoEstimadoEntrega() / 60);
                    put("duracao_total_minutos", 
                        (cotacao.getTempoEstimadoEntrega() - cotacao.getTempoEstimadoColeta()) / 60);
                }});
                put("localizacoes", new HashMap<String, Object>() {{
                    put("coleta", new HashMap<String, Object>() {{
                        put("latitude", cotacao.getLocalizacaoColeta().getLatitude());
                        put("longitude", cotacao.getLocalizacaoColeta().getLongitude());
                    }});
                    put("entrega", new HashMap<String, Object>() {{
                        put("latitude", cotacao.getLocalizacaoEntrega().getLatitude());
                        put("longitude", cotacao.getLocalizacaoEntrega().getLongitude());
                    }});
                }});
                put("tipo_veiculo", cotacao.getTipoVeiculo());
            }});

        } catch (RuntimeException e) {
            log.error("❌ Erro ao solicitar cotação: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                        put("tipo_erro", "COTACAO_INVALIDA");
                    }});

        } catch (Exception e) {
            log.error("❌ Erro inesperado: {}", e.getMessage(), e);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", "Erro ao processar cotação");
                        put("tipo_erro", "ERRO_INTERNO");
                    }});
        }
    }

    /**
     * Endpoint simplificado para cotação com apenas latitudes e longitudes
     * Útil para chamadas rápidas do frontend
     * 
     * @param origemLat Latitude do ponto de coleta
     * @param origemLon Longitude do ponto de coleta
     * @param destinoLat Latitude do ponto de entrega
     * @param destinoLon Longitude do ponto de entrega
     * @param pedidoId ID externo do pedido
     * @param enderecoColeta Endereço de coleta (opcional)
     * @param enderecoEntrega Endereço de entrega (opcional)
     * @return Cotação com valores finais
     */
    @PostMapping("/simples")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cotação Simplificada", 
               description = "Solicita cotação apenas com coordenadas (forma simplificada)")
    public ResponseEntity<?> solicitarCotacaoSimples(
            @RequestParam(value = "origem_lat") Double origemLat,
            @RequestParam(value = "origem_lon") Double origemLon,
            @RequestParam(value = "destino_lat") Double destinoLat,
            @RequestParam(value = "destino_lon") Double destinoLon,
            @RequestParam(value = "pedido_id") String pedidoId,
            @RequestParam(value = "endereco_coleta", required = false) String enderecoColeta,
            @RequestParam(value = "endereco_entrega", required = false) String enderecoEntrega) {

        try {
            log.info("📦 POST /api/v1/uber/quotes/simples - Cotação para: {}", pedidoId);

            // Construir request
            UberQuoteRequestDTO request = UberQuoteRequestDTO.builder()
                    .externalId(pedidoId)
                    .localizacaoColeta(UberQuoteRequestDTO.LocalizacaoDTO.builder()
                            .latitude(origemLat)
                            .longitude(origemLon)
                            .build())
                    .localizacaoEntrega(UberQuoteRequestDTO.LocalizacaoDTO.builder()
                            .latitude(destinoLat)
                            .longitude(destinoLon)
                            .build())
                    .enderecoColeta(enderecoColeta)
                    .enderecoEntrega(enderecoEntrega)
                    .build();

            // Chamar serviço e retornar resposta
            UberQuoteResponseDTO cotacao = uberQuoteService.solicitarCotacao(request);

            BigDecimal freteComTaxa = uberQuoteService.calcularFreteComTaxa(cotacao.getValor());
            BigDecimal margemWin = uberQuoteService.calcularMargemWin(cotacao.getValor());

            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("quote_id", cotacao.getQuoteId());
                put("frete_cliente", freteComTaxa);
                put("frete_uber", cotacao.getValor());
                put("taxa_win", margemWin);
                put("moeda", cotacao.getMoeda());
                put("tempo_coleta_min", cotacao.getTempoEstimadoColeta() / 60);
                put("tempo_entrega_min", cotacao.getTempoEstimadoEntrega() / 60);
            }});

        } catch (Exception e) {
            log.error("❌ Erro: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "sucesso", false,
                        "erro", e.getMessage()
                    ));
        }
    }
}
