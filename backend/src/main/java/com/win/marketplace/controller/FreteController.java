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

/**
 * Controller para cálculo de frete dinâmico via Uber Direct API.
 * 
 * Endpoints:
 * - POST /api/v1/fretes/calcular - Calcular frete em tempo real
 * 
 * Usado pelo frontend durante o checkout para obter valor real do frete.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/fretes")
@RequiredArgsConstructor
public class FreteController {

    private final FreteService freteService;

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
