package com.win.marketplace.controller;

import com.win.marketplace.util.PasswordHashGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para utilitários de desenvolvimento.
 * Apenas disponível quando dev-tools está habilitado.
 * 
 * ATENÇÃO: Nunca habilite este controller em produção!
 */
@RestController
@RequestMapping("/api/v1/dev")
@ConditionalOnProperty(name = "app.dev-tools.enabled", havingValue = "true")
@Tag(name = "Dev Tools", description = "Ferramentas de desenvolvimento (apenas dev/staging)")
public class DevToolsController {

    @PostMapping("/hash-password")
    @Operation(summary = "Gerar hash BCrypt de senha", description = "Gera hash BCrypt para criar usuários admin no banco de dados")
    public ResponseEntity<HashResponse> hashPassword(@RequestBody HashRequest request) {
        
        if (request.getSenha() == null || request.getSenha().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new HashResponse(null, "Senha não pode ser vazia", null));
        }
        
        String hash = PasswordHashGenerator.generateHash(request.getSenha());
        
        String sqlExample = String.format(
            "INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)\n" +
            "VALUES (\n" +
            "  gen_random_uuid(),\n" +
            "  '%s',\n" +
            "  '%s',\n" +
            "  '%s',\n" +
            "  'ADMIN',\n" +
            "  true,\n" +
            "  NOW(),\n" +
            "  NOW()\n" +
            ");",
            request.getEmail() != null ? request.getEmail() : "admin@winmarketplace.com",
            hash,
            request.getNome() != null ? request.getNome() : "Administrador"
        );
        
        return ResponseEntity.ok(new HashResponse(hash, "Hash gerado com sucesso", sqlExample));
    }
    
    @PostMapping("/verify-password")
    @Operation(summary = "Verificar se senha corresponde ao hash", description = "Útil para testar se um hash foi gerado corretamente")
    public ResponseEntity<VerifyResponse> verifyPassword(@RequestBody VerifyRequest request) {
        
        if (request.getSenha() == null || request.getHash() == null) {
            return ResponseEntity.badRequest()
                    .body(new VerifyResponse(false, "Senha e hash são obrigatórios"));
        }
        
        boolean matches = PasswordHashGenerator.verifyPassword(request.getSenha(), request.getHash());
        
        return ResponseEntity.ok(new VerifyResponse(
                matches, 
                matches ? "✅ Senha corresponde ao hash" : "❌ Senha não corresponde ao hash"
        ));
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HashRequest {
        private String senha;
        private String email;
        private String nome;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HashResponse {
        private String hash;
        private String message;
        private String sqlExample;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyRequest {
        private String senha;
        private String hash;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyResponse {
        private boolean matches;
        private String message;
    }
}
