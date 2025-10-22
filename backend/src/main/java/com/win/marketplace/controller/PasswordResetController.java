package com.win.marketplace.controller;

import com.win.marketplace.dto.request.PasswordResetConfirmDTO;
import com.win.marketplace.dto.request.PasswordResetRequestDTO;
import com.win.marketplace.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/password-reset")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * Endpoint para solicitar reset de senha
     * POST /api/v1/password-reset/request
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> solicitarReset(
            @Valid @RequestBody PasswordResetRequestDTO request) {
        log.info("POST /api/v1/password-reset/request - Email: {}", request.email());
        
        passwordResetService.solicitarResetSenha(request);
        
        return ResponseEntity.ok(Map.of(
                "message", "Se o email existir, você receberá instruções para reset de senha"
        ));
    }

    /**
     * Endpoint para validar token de reset
     * GET /api/v1/password-reset/validate/{token}
     */
    @GetMapping("/validate/{token}")
    public ResponseEntity<Map<String, String>> validarToken(@PathVariable String token) {
        log.info("GET /api/v1/password-reset/validate/{}", token);
        
        passwordResetService.validarToken(token);
        
        return ResponseEntity.ok(Map.of(
                "message", "Token válido"
        ));
    }

    /**
     * Endpoint para confirmar reset de senha
     * POST /api/v1/password-reset/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmarReset(
            @Valid @RequestBody PasswordResetConfirmDTO request) {
        log.info("POST /api/v1/password-reset/confirm - Token recebido");
        
        passwordResetService.resetarSenha(request);
        
        return ResponseEntity.ok(Map.of(
                "message", "Senha alterada com sucesso"
        ));
    }
}
