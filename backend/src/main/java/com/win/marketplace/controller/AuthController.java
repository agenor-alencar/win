package com.win.marketplace.controller;

import com.win.marketplace.dto.request.LoginRequestDTO;
import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.ResetPasswordRequestDTO;
import com.win.marketplace.dto.response.AuthResponseDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.security.JwtService;
import com.win.marketplace.service.UsuarioService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller para autenticação de usuários com JWT
 * Endpoints: /api/v1/auth
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Endpoint para registro de novos usuários
     * POST /api/v1/auth/register
     * Retorna token JWT automaticamente após o registro
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO requestDTO) {
        log.info("POST /api/v1/auth/register - Registrando novo usuário: {}", requestDTO.email());
        try {
            // Criar o usuário
            UsuarioResponseDTO usuarioResponse = usuarioService.criarUsuario(requestDTO);
            log.info("Usuário registrado com sucesso: {}", usuarioResponse.id());
            
            // Extrair perfis diretamente do banco (evita ConcurrentModificationException)
            List<String> perfis = usuarioRepository.findPerfisByEmail(requestDTO.email());
            
            // Gerar token JWT
            String token = jwtService.generateToken(requestDTO.email(), perfis);
            
            // Criar resposta com token e dados do usuário
            AuthResponseDTO response = AuthResponseDTO.builder()
                    .access_token(token)
                    .usuario(usuarioResponse)
                    .build();
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Erro ao registrar usuário: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Endpoint para login de usuários com validação de senha e geração de JWT
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDTO) {
        log.info("POST /api/v1/auth/login - Login do usuário: {}", requestDTO.email());
        
        try {
            // Buscar usuário por email com perfis carregados
            Usuario usuario = usuarioRepository.findByEmailWithPerfis(requestDTO.email())
                    .orElseThrow(() -> new BusinessException("Email ou senha incorretos"));
            
            // Verificar se a senha está correta
            if (!passwordEncoder.matches(requestDTO.senha(), usuario.getSenhaHash())) {
                log.warn("Tentativa de login com senha incorreta para o email: {}", requestDTO.email());
                throw new BusinessException("Email ou senha incorretos");
            }
            
            // Verificar se o usuário está ativo
            if (!usuario.getAtivo()) {
                log.warn("Tentativa de login de usuário inativo: {}", requestDTO.email());
                throw new BusinessException("Usuário inativo. Entre em contato com o suporte.");
            }
            
            // Extrair perfis diretamente do banco (evita ConcurrentModificationException)
            List<String> perfis = usuarioRepository.findPerfisByEmail(requestDTO.email());
            
            // Gerar token JWT
            String token = jwtService.generateToken(usuario.getEmail(), perfis);
            
            // Atualizar último acesso
            usuarioService.atualizarUltimoAcesso(requestDTO.email());
            
            // Buscar dados completos do usuário para a resposta
            UsuarioResponseDTO usuarioResponse = usuarioService.buscarPorEmail(requestDTO.email());
            
            // Criar resposta com token e dados do usuário
            AuthResponseDTO response = AuthResponseDTO.builder()
                    .access_token(token)
                    .usuario(usuarioResponse)
                    .build();
            
            log.info("Login realizado com sucesso: {} - Perfis: {}", usuarioResponse.id(), perfis);
            return ResponseEntity.ok(response);
            
        } catch (BusinessException e) {
            log.error("Erro de negócio no login: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Erro ao fazer login: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Compatibilidade: aceita chamadas para /login/{role} (ex.: /login/merchant)
     * e tenta parsear o corpo mesmo que venha malformado (JSON inválido ou
     * application/x-www-form-urlencoded). Isso ajuda durante a migração do
     * frontend que ainda pode chamar o endpoint com role na URL.
     */
    @PostMapping("/login/{role}")
    public ResponseEntity<AuthResponseDTO> loginWithRole(
            @PathVariable String role,
            @RequestBody(required = false) String rawBody,
            HttpServletRequest servletRequest
    ) {
        log.info("POST /api/v1/auth/login/{} - Login (compat) - rawBodyLength={}", role, rawBody == null ? 0 : rawBody.length());

        LoginRequestDTO dto = null;

        if (rawBody != null && !rawBody.isBlank()) {
            // Try parse as JSON
            try {
                dto = objectMapper.readValue(rawBody, LoginRequestDTO.class);
            } catch (JsonProcessingException e) {
                log.warn("Falha ao parsear JSON no login compatível: {}", e.getMessage());
                // Try parse as form-encoded: email=...&senha=...
                try {
                    String body = java.net.URLDecoder.decode(rawBody, java.nio.charset.StandardCharsets.UTF_8.name());
                    String email = null;
                    String senha = null;
                    for (String part : body.split("&")) {
                        String[] kv = part.split("=", 2);
                        if (kv.length == 2) {
                            String k = kv[0].trim();
                            String v = kv[1].trim();
                            if (k.equalsIgnoreCase("email")) email = v;
                            if (k.equalsIgnoreCase("senha") || k.equalsIgnoreCase("password")) senha = v;
                        }
                    }
                    if (email != null && senha != null) {
                        dto = new LoginRequestDTO(email, senha);
                    }
                } catch (Exception ex) {
                    log.warn("Não foi possível extrair parâmetros do corpo: {}", ex.getMessage());
                }
            }
        }

        if (dto == null) {
            // As a last resort, try to read parameters from request parameters
            String emailParam = servletRequest.getParameter("email");
            String senhaParam = servletRequest.getParameter("senha");
            if (emailParam != null && senhaParam != null) {
                dto = new LoginRequestDTO(emailParam, senhaParam);
            }
        }

        if (dto == null) {
            throw new IllegalArgumentException("Não foi possível interpretar os dados de login");
        }

        // Delegate to existing logic (now returns JWT)
        return login(dto);
    }

    /**
     * Endpoint para verificar se o usuário está autenticado
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(@RequestParam String email) {
        log.info("GET /api/v1/auth/me - Verificando usuário: {}", email);
        UsuarioResponseDTO response = usuarioService.buscarPorEmail(email);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para resetar senha do usuário
     * POST /api/v1/auth/reset-password
     * Permite ao usuário alterar sua senha informando o email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO requestDTO) {
        log.info("POST /api/v1/auth/reset-password - Resetando senha para: {}", requestDTO.email());
        
        try {
            // Buscar usuário por email
            Usuario usuario = usuarioRepository.findByEmail(requestDTO.email())
                    .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
            
            // Atualizar senha
            usuario.setSenhaHash(passwordEncoder.encode(requestDTO.novaSenha()));
            usuarioRepository.save(usuario);
            
            log.info("Senha alterada com sucesso para o usuário: {}", requestDTO.email());
            return ResponseEntity.ok(Map.of(
                "message", "Senha alterada com sucesso!",
                "email", requestDTO.email()
            ));
            
        } catch (BusinessException e) {
            log.error("Erro ao resetar senha: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Erro ao resetar senha: {}", e.getMessage(), e);
            throw new BusinessException("Erro ao processar solicitação de reset de senha");
        }
    }

    /**
     * Endpoint para atualizar o token JWT com os perfis mais recentes do usuário
     * POST /api/v1/auth/refresh-token
     * Retorna novo token JWT com perfis atualizados
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestParam String email) {
        log.info("POST /api/v1/auth/refresh-token - Atualizando token para: {}", email);
        
        // Buscar usuário do banco de dados
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (usuario.getAtivo() == null || !usuario.getAtivo()) {
            throw new BusinessException("Usuário inativo");
        }

        // Buscar perfis atualizados do usuário diretamente do banco através de usuarioPerfis
        List<String> perfis = usuario.getUsuarioPerfis().stream()
                .map(up -> up.getPerfil())
                .filter(perfil -> perfil != null && perfil.getAtivo() != null && perfil.getAtivo())
                .map(perfil -> perfil.getNome())
                .toList();
        
        log.info("Perfis atualizados para {}: {}", email, perfis);

        // Gerar novo token JWT com perfis atualizados
        String token = jwtService.generateToken(email, perfis);

        // Converter usuário para DTO
        UsuarioResponseDTO usuarioDTO = usuarioService.buscarPorEmail(email);

        // Retornar resposta com novo token
        AuthResponseDTO response = AuthResponseDTO.builder()
                .access_token(token)
                .usuario(usuarioDTO)
                .token_type("Bearer")
                .expires_in(86400L)
                .build();
        
        log.info("Token atualizado com sucesso para usuário: {} com perfis: {}", email, perfis);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para adicionar perfil ADMIN a um usuário existente
     * POST /api/v1/auth/promote-to-admin
     * Requer autenticação de ADMIN
     */
    @PostMapping("/promote-to-admin")
    public ResponseEntity<Map<String, String>> promoteToAdmin(@RequestParam String email) {
        log.info("POST /api/v1/auth/promote-to-admin - Promovendo usuário: {}", email);
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
        
        // Verificar se já tem perfil ADMIN
        boolean jaTemAdmin = usuario.getUsuarioPerfis().stream()
            .anyMatch(up -> "ADMIN".equals(up.getPerfil().getNome()));
        
        if (jaTemAdmin) {
            return ResponseEntity.ok(Map.of(
                "message", "Usuário já possui perfil ADMIN",
                "email", email
            ));
        }
        
        // Adicionar perfil ADMIN através do serviço
        usuarioService.adicionarPerfilAdmin(usuario.getId());
        
        log.info("Usuário {} promovido a ADMIN com sucesso", email);
        return ResponseEntity.ok(Map.of(
            "message", "Usuário promovido a ADMIN com sucesso",
            "email", email
        ));
    }
}
