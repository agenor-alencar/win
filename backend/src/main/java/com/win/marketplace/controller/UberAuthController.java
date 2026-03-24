package com.win.marketplace.controller;

import com.win.marketplace.service.UberAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller para gerenciar autenticação OAuth com Uber Direct
 * 
 * Endpoints:
 * - Obter novo token
 * - Revogar token
 * - Obter estatísticas
 * - Validar configuração
 * 
 * ⚠️ Acesso restrito a ADMIN apenas
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/uber/auth")
@RequiredArgsConstructor
@Tag(name = "Uber Auth", description = "APIs de Autenticação OAuth com Uber Direct")
public class UberAuthController {

    private final UberAuthService uberAuthService;

    /**
     * Obtém um novo token de acesso OAuth da Uber
     * 
     * @return Token de acesso válido
     */
    @PostMapping("/token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obter Novo Token", description = "Solicita novo token OAuth à Uber e o armazena em cache")
    public ResponseEntity<?> obterNovoToken() {
        try {
            log.info("🔐 POST /api/v1/uber/auth/token - Obtendo novo token");
            
            String token = uberAuthService.obterAccessToken();
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("access_token", token);
                put("token_type", "Bearer");
                put("mensagem", "Token obtido com sucesso");
            }});
        } catch (Exception e) {
            log.error("❌ Erro ao obter token: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                    }});
        }
    }

    /**
     * Revoga um token específico
     * 
     * @param tokenId ID do token a revogar
     */
    @PostMapping("/token/{tokenId}/revogar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Revogar Token", description = "Marca um token como revogado")
    public ResponseEntity<?> revogarToken(@PathVariable String tokenId) {
        try {
            log.info("🚫 POST /api/v1/uber/auth/token/{}/revogar", tokenId);
            
            uberAuthService.revogarToken(tokenId);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("mensagem", "Token revogado com sucesso");
            }});
        } catch (Exception e) {
            log.error("❌ Erro ao revogar token: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                    }});
        }
    }

    /**
     * Obtém estatísticas de tokens armazenados em cache
     */
    @GetMapping("/tokens/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Estatísticas de Tokens", description = "Retorna informações sobre tokens em cache")
    public ResponseEntity<?> obterEstatisticas() {
        try {
            log.info("📊 GET /api/v1/uber/auth/tokens/stats");
            
            Map<String, Object> stats = uberAuthService.obterEstatisticasTokens();
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("dados", stats);
            }});
        } catch (Exception e) {
            log.error("❌ Erro ao obter estatísticas: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                    }});
        }
    }

    /**
     * Valida se a configuração da Uber está correta
     */
    @PostMapping("/config/validar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Validar Configuração", description = "Verifica se as credenciais da Uber estão configuradas")
    public ResponseEntity<?> validarConfiguracao() {
        try {
            log.info("🔍 POST /api/v1/uber/auth/config/validar");
            
            Boolean valido = uberAuthService.validarConfiguracao();
            
            if (valido) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("sucesso", true);
                    put("configurado", true);
                    put("mensagem", "Credenciais da Uber estão configuradas corretamente");
                }});
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("sucesso", false);
                            put("configurado", false);
                            put("mensagem", "Credenciais da Uber não estão configuradas");
                            put("variaveis_obrigatorias", new String[]{
                                "UBER_CUSTOMER_ID",
                                "UBER_CLIENT_ID",
                                "UBER_CLIENT_SECRET"
                            });
                        }});
            }
        } catch (Exception e) {
            log.error("❌ Erro ao validar configuração: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                    }});
        }
    }

    /**
     * Limpa manualmente tokens expirados
     */
    @PostMapping("/tokens/limpar-expirados")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Limpar Tokens Expirados", description = "Remove tokens expirados do banco de dados")
    public ResponseEntity<?> limparTokensExpirados() {
        try {
            log.info("🧹 POST /api/v1/uber/auth/tokens/limpar-expirados");
            
            uberAuthService.limparTokensExpirados();
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("sucesso", true);
                put("mensagem", "Tokens expirados limpados com sucesso");
            }});
        } catch (Exception e) {
            log.error("❌ Erro ao limpar tokens: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("sucesso", false);
                        put("erro", e.getMessage());
                    }});
        }
    }
}
