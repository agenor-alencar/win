package com.win.marketplace.service;

import com.win.marketplace.dto.request.FreteRequestDTO;
import com.win.marketplace.dto.request.SimulacaoFreteRequestDTO;
import com.win.marketplace.dto.response.FreteResponseDTO;
import com.win.marketplace.dto.response.SimulacaoFreteResponseDTO;
import com.win.marketplace.model.Endereco;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.repository.EnderecoRepository;
import com.win.marketplace.repository.LojistaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service para cálculo de frete dinâmico via Uber Direct API.
 * 
 * Responsabilidades:
 * - Buscar coordenadas geocodificadas de lojista e endereço
 * - Chamar UberFlashService para cotação
 * - Mapear resposta para FreteResponseDTO
 * - Tratamento de erros e fallbacks
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FreteService {

    private final LojistaRepository lojistaRepository;
    private final EnderecoRepository enderecoRepository;
    private final UberFlashService uberFlashService;
    private final GeocodingService geocodingService;

    @Value("${uber.api.enabled:false}")
    private Boolean uberApiEnabled;

    /**
     * Calcula frete dinâmico usando coordenadas geocodificadas.
     * 
     * Fluxo:
     * 1. Buscar lojista (origem) no banco
     * 2. Buscar endereço de entrega (destino) no banco
     * 3. Validar que ambos têm coordenadas geocodificadas
     * 4. Chamar Uber API para cotação
     * 5. Retornar valor calculado
     * 
     * @param request Dados da requisição (lojistaId + enderecoEntregaId)
     * @return Cotação de frete com valores
     */
    public FreteResponseDTO calcularFrete(FreteRequestDTO request) {
        log.info("🚚 Calculando frete - Lojista: {}, Endereço: {}", 
                request.getLojistaId(), request.getEnderecoEntregaId());

        try {
            // 1. BUSCAR LOJISTA (ORIGEM)
            Lojista lojista = lojistaRepository.findById(request.getLojistaId())
                    .orElseThrow(() -> new RuntimeException("Lojista não encontrado: " + request.getLojistaId()));

            if (!lojista.getAtivo()) {
                throw new RuntimeException("Lojista inativo");
            }

            // 2. BUSCAR ENDEREÇO DE ENTREGA (DESTINO)
            Endereco enderecoEntrega = enderecoRepository.findById(request.getEnderecoEntregaId())
                    .orElseThrow(() -> new RuntimeException("Endereço de entrega não encontrado: " + 
                            request.getEnderecoEntregaId()));

            if (!enderecoEntrega.getAtivo()) {
                throw new RuntimeException("Endereço de entrega inativo");
            }

            // 3. VALIDAR E OBTER COORDENADAS DE ORIGEM
            Double origemLat = lojista.getLatitude();
            Double origemLon = lojista.getLongitude();

            if (origemLat == null || origemLon == null) {
                log.warn("⚠️ Lojista {} sem coordenadas geocodificadas, tentando geocodificar agora...", 
                        lojista.getId());
                
                // Tentar geocodificar em tempo real
                String enderecoOrigem = construirEnderecoCompleto(
                        lojista.getLogradouro(), lojista.getNumero(), lojista.getBairro(),
                        lojista.getCidade(), lojista.getUf()
                );
                
                Double[] coordenadas = geocodingService.geocodificar(lojista.getCep(), enderecoOrigem);
                if (coordenadas != null) {
                    origemLat = coordenadas[0];
                    origemLon = coordenadas[1];
                    log.info("✅ Lojista geocodificado: lat={}, lon={}", origemLat, origemLon);
                } else {
                    throw new RuntimeException("Não foi possível geocodificar o endereço do lojista. " +
                            "Configure as coordenadas no cadastro.");
                }
            }

            // 4. VALIDAR E OBTER COORDENADAS DE DESTINO
            Double destinoLat = enderecoEntrega.getLatitude();
            Double destinoLon = enderecoEntrega.getLongitude();

            if (destinoLat == null || destinoLon == null) {
                log.warn("⚠️ Endereço {} sem coordenadas geocodificadas, tentando geocodificar agora...", 
                        enderecoEntrega.getId());
                
                // Tentar geocodificar em tempo real
                String enderecoDestino = construirEnderecoCompleto(
                        enderecoEntrega.getLogradouro(), enderecoEntrega.getNumero(), 
                        enderecoEntrega.getBairro(), enderecoEntrega.getCidade(), enderecoEntrega.getEstado()
                );
                
                Double[] coordenadas = geocodingService.geocodificar(enderecoEntrega.getCep(), enderecoDestino);
                if (coordenadas != null) {
                    destinoLat = coordenadas[0];
                    destinoLon = coordenadas[1];
                    log.info("✅ Endereço geocodificado: lat={}, lon={}", destinoLat, destinoLon);
                } else {
                    throw new RuntimeException("Não foi possível geocodificar o endereço de entrega. " +
                            "Verifique se o CEP está correto.");
                }
            }

            // 5. PREPARAR REQUEST PARA UBER API
            String enderecoOrigemCompleto = construirEnderecoCompleto(
                    lojista.getLogradouro(), lojista.getNumero(), lojista.getBairro(),
                    lojista.getCidade(), lojista.getUf()
            );

            String enderecoDestinoCompleto = construirEnderecoCompleto(
                    enderecoEntrega.getLogradouro(), enderecoEntrega.getNumero(), 
                    enderecoEntrega.getBairro(), enderecoEntrega.getCidade(), enderecoEntrega.getEstado()
            );

            SimulacaoFreteRequestDTO simulacaoRequest = SimulacaoFreteRequestDTO.builder()
                    .cepOrigem(lojista.getCep())
                    .cepDestino(enderecoEntrega.getCep())
                    .enderecoOrigemCompleto(enderecoOrigemCompleto)
                    .enderecoDestinoCompleto(enderecoDestinoCompleto)
                    .origemLatitude(origemLat)
                    .origemLongitude(origemLon)
                    .destinoLatitude(destinoLat)
                    .destinoLongitude(destinoLon)
                    .pesoTotalKg(request.getPesoTotalKg() != null ? request.getPesoTotalKg() : 2.0)
                    .build();

            // 6. CHAMAR UBER API
            SimulacaoFreteResponseDTO simulacao = uberFlashService.simularFrete(simulacaoRequest);

            // 7. MAPEAR PARA RESPONSE DTO
            if (simulacao.getSucesso()) {
                log.info("✅ Frete calculado - Valor: R$ {}, Distância: {}km, Tempo: {}min",
                        simulacao.getValorFreteTotal(), simulacao.getDistanciaKm(), 
                        simulacao.getTempoEstimadoMinutos());

                return FreteResponseDTO.builder()
                        .sucesso(true)
                        .quoteId(simulacao.getQuoteId())
                        .valorFreteTotal(simulacao.getValorFreteTotal())
                        .valorCorridaUber(simulacao.getValorCorridaUber())
                        .taxaWin(simulacao.getTaxaWinmarket())
                        .distanciaKm(simulacao.getDistanciaKm())
                        .tempoEstimadoMinutos(simulacao.getTempoEstimadoMinutos())
                        .tipoVeiculo(simulacao.getTipoVeiculo())
                        .mensagem(simulacao.getMensagem())
                        .modoProducao(uberApiEnabled)
                        .build();
            } else {
                log.error("❌ Erro ao calcular frete: {}", simulacao.getErro());
                return FreteResponseDTO.builder()
                        .sucesso(false)
                        .erro(simulacao.getErro())
                        .build();
            }

        } catch (Exception e) {
            log.error("❌ Erro ao calcular frete", e);
            return FreteResponseDTO.builder()
                    .sucesso(false)
                    .erro("Erro ao calcular frete: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Constrói endereço completo formatado para geocodificação.
     */
    private String construirEnderecoCompleto(String logradouro, String numero, 
                                            String bairro, String cidade, String uf) {
        return String.format("%s, %s - %s, %s - %s", 
                logradouro, numero, bairro, cidade, uf);
    }
}
