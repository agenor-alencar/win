package com.win.marketplace.controller;

import com.win.marketplace.dto.request.ValidarPinRequestDTO;
import com.win.marketplace.dto.response.ValidarPinResponseDTO;
import com.win.marketplace.service.PinValidacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller para validação de PIN codes.
 * 
 * Endpoints:
 * - POST /api/v1/entrega/{entregaId}/gerar-pin
 * - POST /api/v1/entrega/{entregaId}/validar-pin
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/entrega")
@RequiredArgsConstructor
@Tag(name = "PIN Validation", description = "Endpoints para geração e validação de PIN codes")
public class PinValidacaoController {

    private final PinValidacaoService pinValidacaoService;

    /**
     * Gera um novo PIN code para uma entrega.
     * 
     * PIN é enviado por SMS/WhatsApp para o motorista (COLETA) ou cliente (ENTREGA).
     * 
     * @param entregaId ID da entrega
     * @param tipo Tipo de PIN (COLETA ou ENTREGA)
     * @param auth Autenticação do usuário
     * @return PIN gerado em 4-6 dígitos
     */
    @PostMapping("/{entregaId}/gerar-pin")
    @Operation(summary = "Gera um novo PIN code",
            description = "Gera um PIN code de 4-6 dígitos para a entrega especificada")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "PIN gerado com sucesso",
                    content = @Content(schema = @Schema(example = "{\"pin\": \"1234\"}"))),
            @ApiResponse(responseCode = "404", description = "Entrega não encontrada"),
            @ApiResponse(responseCode = "400", description = "PIN já foi gerado para esta etapa")
    })
    public ResponseEntity<PinGeradoDTO> gerarPin(
            @Parameter(description = "ID da entrega")
            @PathVariable UUID entregaId,

            @Parameter(description = "Tipo de PIN (COLETA ou ENTREGA)")
            @RequestParam(required = false, defaultValue = "COLETA") String tipo,

            @Parameter(hidden = true)
            Authentication auth) {

        log.info("Requisição para gerar PIN: {} tipo: {}", entregaId, tipo);

        try {
            String pinGerado = pinValidacaoService.gerarPin(entregaId, 
                    com.win.marketplace.model.enums.TipoPinValidacao.valueOf(tipo));

            return ResponseEntity.ok(new PinGeradoDTO(pinGerado, "PIN gerado com sucesso"));

        } catch (Exception e) {
            log.error("Erro ao gerar PIN", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Valida um PIN code enviado pelo usuário.
     * 
     * Implementa proteção contra brute force:
     * - Máximo 3 tentativas
     * - Bloqueio por 15 minutos após 3 falhas
     * 
     * @param entregaId ID da entrega
     * @param request DTO com PIN e tipo
     * @param auth Autenticação do usuário
     * @param request HTTP request para capturar IP e User-Agent
     * @return Resultado da validação
     */
    @PostMapping("/{entregaId}/validar-pin")
    @Operation(summary = "Valida um PIN code",
            description = "Valida o PIN code enviado pelo usuário com proteção contra brute force")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pin validado com sucesso ou falha",
                    content = @Content(schema = @Schema(implementation = ValidarPinResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Entrega ou PIN não encontrado"),
            @ApiResponse(responseCode = "400", description = "Erro na validação")
    })
    public ResponseEntity<ValidarPinResponseDTO> validarPin(
            @Parameter(description = "ID da entrega")
            @PathVariable UUID entregaId,

            @Valid @RequestBody ValidarPinRequestDTO request,

            @Parameter(hidden = true)
            Authentication auth,

            @Parameter(hidden = true)
            HttpServletRequest httpRequest) {

        log.info("Requisição para validar PIN: {}", entregaId);

        try {
            // Extrair IP do cliente
            String clientIp = extrairIpCliente(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            UUID usuarioId = UUID.fromString(auth.getName());

            ValidarPinResponseDTO resultado = pinValidacaoService.validarPin(
                    request,
                    usuarioId,
                    clientIp,
                    userAgent
            );

            // Retornar 200 em ambos os casos (sucesso e falha)
            // Cliente diferencia pelo campo "validado" no response
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("Erro ao validar PIN", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Extrai o IP real do cliente considerando proxies (X-Forwarded-For).
     * 
     * @param request HTTP request
     * @return IP do cliente
     */
    private String extrairIpCliente(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * DTO para resposta de geração de PIN.
     */
    public record PinGeradoDTO(
            String pin,
            String mensagem
    ) {}
}
