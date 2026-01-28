package com.win.marketplace.controller;

import com.win.marketplace.dto.request.FreteRequestDTO;
import com.win.marketplace.dto.response.FreteResponseDTO;
import com.win.marketplace.service.FreteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Controller para cálculo de frete dinâmico via Uber Direct API.
 * 
 * Endpoints:
 * - GET /api/v1/fretes/estimar - Estimativa rápida por CEP (UX otimizada)
 * - POST /api/v1/fretes/calcular - Cálculo preciso com endereço completo
 * 
 * Fluxo recomendado:
 * 1. Usuário informa CEP na home/produto → chama /estimar
 * 2. CEP salvo no localStorage do frontend
 * 3. No checkout, usa CEP + endereço completo → chama /calcular
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/fretes")
@RequiredArgsConstructor
public class FreteController {

    private final FreteService freteService;

    /**
     * 🚀 Estimativa rápida de frete apenas com CEP (UX otimizada).
     * 
     * Endpoint usado na home/produto para dar visibilidade antecipada do frete.
     * Não requer autenticação para facilitar navegação.
     * 
     * Exemplo: GET /api/v1/fretes/estimar?cepDestino=70040902&lojistaId=uuid&pesoKg=1.5
     * 
     * Resposta:
     * {
     *   "sucesso": true,
     *   "valorFreteTotal": 18.50,
     *   "tempoEstimadoMinutos": 30,
     *   "distanciaKm": 6.2,
     *   "mensagem": "Estimativa baseada no CEP. Valor final no checkout.",
     *   "modoProducao": true
     * }
     * 
     * @param cepDestino CEP do cliente (8 dígitos)
     * @param lojistaId UUID do lojista
     * @param pesoKg Peso estimado em kg (padrão: 1.0)
     * @return Estimativa de frete
     */
    @GetMapping("/estimar")
    public ResponseEntity<FreteResponseDTO> estimarFretePorCep(
            @RequestParam String cepDestino,
            @RequestParam String lojistaId,
            @RequestParam(defaultValue = "1.0") Double pesoKg) {
        
        log.info("📍 Estimativa rápida - CEP: {}, Lojista: {}", cepDestino, lojistaId);

        try {
            FreteResponseDTO response = freteService.estimarFretePorCep(
                    cepDestino, 
                    java.util.UUID.fromString(lojistaId), 
                    pesoKg
            );

            if (response.getSucesso()) {
                log.info("✅ Estimativa calculada - R$ {} (~{}min)", 
                        response.getValorFreteTotal(), response.getTempoEstimadoMinutos());
                return ResponseEntity.ok(response);
            } else {
                log.warn("⚠️ Erro na estimativa: {}", response.getErro());
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("❌ Erro ao estimar frete por CEP", e);
            return ResponseEntity.badRequest().body(
                    FreteResponseDTO.builder()
                            .sucesso(false)
                            .erro("Erro ao calcular estimativa: " + e.getMessage())
                            .valorFreteTotal(BigDecimal.valueOf(15.0)) // Fallback
                            .tempoEstimadoMinutos(30)
                            .modoProducao(false)
                            .build()
            );
        }
    }

    /**
     * Calcula frete dinâmico usando coordenadas geocodificadas.
     * 
     * Endpoint usado durante checkout para mostrar valor real antes de finalizar pedido.
     * 
     * Exemplo de requisição:
     * {
     *   "lojistaId": "uuid-do-lojista",
     *   "enderecoEntregaId": "uuid-do-endereco",
     *   "pesoTotalKg": 2.5
     * }
     * 
     * Exemplo de resposta:
     * {
     *   "sucesso": true,
     *   "quoteId": "uber-quote-xyz123",
     *   "valorFreteTotal": 17.90,
     *   "valorCorridaUber": 16.27,
     *   "taxaWin": 1.63,
     *   "distanciaKm": 5.2,
     *   "tempoEstimadoMinutos": 25,
     *   "tipoVeiculo": "MOTO_PEQUENO",
     *   "mensagem": "Entrega expressa em até 25 minutos",
     *   "modoPropducao": true
     * }
     * 
     * @param request Dados para cálculo (lojistaId + enderecoEntregaId + peso opcional)
     * @return Cotação com valor do frete e detalhes
     */
    @PostMapping("/calcular")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FreteResponseDTO> calcularFrete(
            @Valid @RequestBody FreteRequestDTO request) {
        
        log.info("📦 Requisição de cálculo de frete - Lojista: {}, Endereço: {}", 
                request.getLojistaId(), request.getEnderecoEntregaId());

        FreteResponseDTO response = freteService.calcularFrete(request);

        if (response.getSucesso()) {
            log.info("✅ Frete calculado com sucesso - Valor: R$ {}", response.getValorFreteTotal());
            return ResponseEntity.ok(response);
        } else {
            log.warn("⚠️ Erro ao calcular frete: {}", response.getErro());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Health check do serviço de frete.
     * Verifica se Uber API está configurada.
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verificarStatus() {
        // TODO: Implementar verificação de credenciais e status da API Uber
        return ResponseEntity.ok(java.util.Map.of(
                "servicoAtivo", true,
                "mensagem", "Serviço de frete operacional"
        ));
    }
}
