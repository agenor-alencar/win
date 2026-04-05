package com.win.marketplace.controller;

import com.win.marketplace.dto.request.LoginRequestDTO;
import com.win.marketplace.dto.request.OtpRequestDTO;
import com.win.marketplace.dto.request.OtpVerifyRequestDTO;
import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.ResetPasswordRequestDTO;
import com.win.marketplace.dto.response.AuthResponseDTO;
import com.win.marketplace.dto.response.OtpResponseDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.integration.TwilioSmsClient;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.security.JwtService;
import com.win.marketplace.security.LoginAttemptService;
import com.win.marketplace.security.SmsRateLimitService;
import com.win.marketplace.service.OtpService;
import com.win.marketplace.service.UsuarioService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

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
    private final LoginAttemptService loginAttemptService;
    private final SmsRateLimitService smsRateLimitService;
    private final OtpService otpService;
    private final TwilioSmsClient twilioSmsClient;
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
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDTO, HttpServletRequest request) {
        String normalizedEmail = normalizeEmail(requestDTO.email());
        log.info("POST /api/v1/auth/login - Login do usuário: {}", normalizedEmail);

        String clientIp = extractClientIp(request);
        String attemptKey = loginAttemptService.buildKey(normalizedEmail, clientIp);

        if (loginAttemptService.isBlocked(attemptKey)) {
            long secondsRemaining = loginAttemptService.blockedSecondsRemaining(attemptKey);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas tentativas de login. Tente novamente em " + secondsRemaining + " segundos"
            );
        }

        try {
            // Buscar usuário por email com perfis carregados
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailWithPerfisIgnoreCase(normalizedEmail);
            if (usuarioOpt.isEmpty()) {
                loginAttemptService.registerFailure(attemptKey);
                throw new BusinessException("Email ou senha incorretos");
            }
            Usuario usuario = usuarioOpt.get();
            
            // Verificar se a senha está correta
            if (!passwordEncoder.matches(requestDTO.senha(), usuario.getSenhaHash())) {
                log.warn("Tentativa de login com senha incorreta para o email: {}", normalizedEmail);
                loginAttemptService.registerFailure(attemptKey);
                throw new BusinessException("Email ou senha incorretos");
            }
            
            // Verificar se o usuário está ativo
            if (!usuario.getAtivo()) {
                log.warn("Tentativa de login de usuário inativo: {}", normalizedEmail);
                loginAttemptService.registerFailure(attemptKey);
                throw new BusinessException("Usuário inativo. Entre em contato com o suporte.");
            }

            loginAttemptService.registerSuccess(attemptKey);
            
            // Extrair perfis diretamente do banco (evita ConcurrentModificationException)
            List<String> perfis = usuarioRepository.findPerfisByEmailIgnoreCase(normalizedEmail);
            
            // Gerar token JWT
            String token = jwtService.generateToken(usuario.getEmail(), perfis);
            
            // Atualizar último acesso
            usuarioService.atualizarUltimoAcesso(usuario.getEmail());
            
            // Buscar dados completos do usuário para a resposta
            UsuarioResponseDTO usuarioResponse = usuarioService.buscarPorEmail(usuario.getEmail());
            
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
            loginAttemptService.registerFailure(attemptKey);
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
        return login(dto, servletRequest);
    }

    /**
     * Endpoint para verificar se o usuário está autenticado
     * GET /api/v1/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me() {
        String authenticatedEmail = getAuthenticatedEmail();
        log.info("GET /api/v1/auth/me - Verificando usuário autenticado: {}", authenticatedEmail);
        UsuarioResponseDTO response = usuarioService.buscarPorEmail(authenticatedEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para resetar senha do usuário
     * POST /api/v1/auth/reset-password
     * Permite ao usuário alterar sua senha informando o email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO requestDTO) {
        String authenticatedEmail = getAuthenticatedEmail();
        log.info("POST /api/v1/auth/reset-password - Usuário autenticado: {}", authenticatedEmail);

        if (!authenticatedEmail.equalsIgnoreCase(requestDTO.email())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido alterar senha de outro usuário");
        }
        
        try {
            // Buscar usuário por email
            Usuario usuario = usuarioRepository.findByEmail(authenticatedEmail)
                    .orElseThrow(() -> new BusinessException("Usuário não encontrado"));
            
            // Atualizar senha
            usuario.setSenhaHash(passwordEncoder.encode(requestDTO.novaSenha()));
            usuarioRepository.save(usuario);
            
            log.info("Senha alterada com sucesso para o usuário: {}", requestDTO.email());
            return ResponseEntity.ok(Map.of(
                "message", "Senha alterada com sucesso!",
                "email", authenticatedEmail
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
    public ResponseEntity<AuthResponseDTO> refreshToken() {
        String authenticatedEmail = getAuthenticatedEmail();
        log.info("POST /api/v1/auth/refresh-token - Atualizando token para: {}", authenticatedEmail);
        
        // Buscar usuário do banco de dados
        Usuario usuario = usuarioRepository.findByEmail(authenticatedEmail)
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
        
        log.info("Perfis atualizados para {}: {}", authenticatedEmail, perfis);

        // Gerar novo token JWT com perfis atualizados
        String token = jwtService.generateToken(authenticatedEmail, perfis);

        // Converter usuário para DTO
        UsuarioResponseDTO usuarioDTO = usuarioService.buscarPorEmail(authenticatedEmail);

        // Retornar resposta com novo token
        AuthResponseDTO response = AuthResponseDTO.builder()
                .access_token(token)
                .usuario(usuarioDTO)
                .token_type("Bearer")
                .expires_in(86400L)
                .build();
        
        log.info("Token atualizado com sucesso para usuário: {} com perfis: {}", authenticatedEmail, perfis);
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

    /**
     * Endpoint para solicitar código OTP via SMS
     * POST /api/v1/auth/request-code
     * 
     * Flow:
     * 1. Validar formato do telefone
     * 2. Verificar rate limiting (máx 3 req/min por IP+telefone)
     * 3. Gerar código OTP aleatório de 6 dígitos
     * 4. Salvar no banco com TTL de 5 minutos
     * 5. Enviar via SMS Twilio
     * 6. Retornar sucesso
     * 
     * Resposta de sucesso: HTTP 200
     * {
     *   "telefone": "+5511987654321",
     *   "mensagem": "Código de verificação enviado com sucesso via SMS",
     *   "tempo_expiracao_segundos": 300
     * }
     * 
     * Resposta de erro - Rate limit: HTTP 429
     * Resposta de erro - SMS falha: HTTP 503
     */
    @PostMapping("/request-code")
    public ResponseEntity<OtpResponseDTO> solicitarCodigoOtp(
            @Valid @RequestBody OtpRequestDTO requestDTO,
            HttpServletRequest request
    ) {
        String telefone = requestDTO.telefone();
        String clientIp = extractClientIp(request);
        String chaveRateLimit = smsRateLimitService.construirChave(clientIp, telefone);

        log.info("POST /api/v1/auth/request-code - Solicitação de OTP para: {} (IP: {})", telefone, clientIp);

        // 1. Verificar se está bloqueado por rate limit
        if (smsRateLimitService.estaBlockeado(chaveRateLimit)) {
            long segundosRestantes = smsRateLimitService.obterSegundosRestantes(chaveRateLimit);
            log.warn("Rate limit atingido para telefone: {} - IP: {} - Esperar: {} segundos",
                    telefone, clientIp, segundosRestantes);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Muitos códigos solicitados. Tente novamente em " + segundosRestantes + " segundos"
            );
        }

        // 2. Registrar tentativa de solicitação
        if (!smsRateLimitService.registrarSolicitacao(chaveRateLimit)) {
            log.warn("Rate limit acionado para: {} - IP: {}", telefone, clientIp);
            long segundosRestantes = smsRateLimitService.obterSegundosRestantes(chaveRateLimit);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Muitos códigos solicitados. Tente novamente em " + segundosRestantes + " segundos"
            );
        }

        try {
            // 3. Gerar código OTP
            String codigoOtp = otpService.gerarCodigoOtp(telefone);
            log.debug("Código OTP gerado para: {} - Código: {}", telefone, codigoOtp);

            // 4. Enviar via SMS Twilio
            twilioSmsClient.enviarSmsComCodigoOtp(telefone, codigoOtp);
            log.info("SMS enviado com sucesso para: {}", telefone);

            // 5. Limpar contagem (SMS foi enviado com sucesso)
            smsRateLimitService.limparContagem(chaveRateLimit);

            // 6. Retornar resposta de sucesso
            OtpResponseDTO resposta = otpService.construirRespostaSucesso(telefone);
            return ResponseEntity.ok(resposta);

        } catch (ResponseStatusException e) {
            // Erro esperado (Twilio indisponível, etc) - não incrementar rate limit
            log.warn("Erro esperado ao enviar OTP: {}", e.getReason());
            throw e;
        } catch (Exception e) {
            log.error("Erro inesperado ao solicitar código OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao processar solicitação. Tente novamente"
            );
        }
    }

    /**
     * Endpoint para validar e fazer login com código OTP
     * POST /api/v1/auth/verify-code
     * 
     * Flow:
     * 1. Validar formato do código (6 dígitos)
     * 2. Validar código OTP armazenado
     * 3. Buscar ou criar usuário baseado no telefone
     * 4. Gerar token JWT
     * 5. Retornar token + dados do usuário
     * 
     * Resposta de sucesso: HTTP 200
     * {
     *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "usuario": {
     *     "id": "550e8400-e29b-41d4-a716-446655440000",
     *     "nome": "João Silva",
     *     "telefone": "+5511987654321",
     *     "email": "joao@example.com"
     *   }
     * }
     * 
     * Resposta de erro - Código inválido: HTTP 401
     */
    @PostMapping("/verify-code")
    public ResponseEntity<AuthResponseDTO> validarCodigoOtp(
            @Valid @RequestBody OtpVerifyRequestDTO requestDTO,
            HttpServletRequest request
    ) {
        String telefone = requestDTO.telefone();
        String codigo = requestDTO.codigo();
        String clientIp = extractClientIp(request);

        log.info("POST /api/v1/auth/verify-code - Validação de OTP para: {} (IP: {})", telefone, clientIp);

        try {
            // 1. Validar código OTP
            otpService.validarCodigoOtp(telefone, codigo);
            log.info("Código OTP validado com sucesso para: {}", telefone);

            // 2. Buscar ou criar usuário baseado no telefone
            Usuario usuario = usuarioRepository.findByTelefone(telefone)
                    .orElseGet(() -> {
                        // Se não existe, criar novo usuário com telefone
                        log.info("Criando novo usuário com telefone: {}", telefone);
                        Usuario novoUsuario = new Usuario();
                        novoUsuario.setTelefone(telefone);
                        novoUsuario.setNome(telefone); // Usar telefone como nome temporário
                        novoUsuario.setEmail("otp_" + telefone.replace("+", "").replace(" ", "") + "_" + System.currentTimeMillis() + "@otp-login.local");
                        novoUsuario.setSenhaHash(""); // Sem senha em login OTP
                        novoUsuario.setAtivo(true);
                        return usuarioRepository.save(novoUsuario);
                    });

            // 3. Verificar se usuário está ativo
            if (!usuario.getAtivo()) {
                log.warn("Tentativa de acesso com usuário inativo: {}", telefone);
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Usuário inativo. Entre em contato com o suporte"
                );
            }

            // 4. Extrair perfis
            List<String> perfis = usuarioRepository.findPerfisByEmail(usuario.getEmail());
            if (perfis.isEmpty()) {
                perfis = List.of("USER"); // Perfil padrão
            }

            // 5. Gerar token JWT
            String token = jwtService.generateToken(usuario.getEmail(), perfis);
            log.info("Token JWT gerado para usuário OTP: {} - Perfis: {}", usuario.getId(), perfis);

            // 6. Atualizar último acesso
            usuarioService.atualizarUltimoAcesso(usuario.getEmail());

            // 7. Buscar dados completos do usuário para resposta
            UsuarioResponseDTO usuarioResponse = usuarioService.buscarPorEmail(usuario.getEmail());

            // 8. Criar resposta
            AuthResponseDTO response = AuthResponseDTO.builder()
                    .access_token(token)
                    .usuario(usuarioResponse)
                    .token_type("Bearer")
                    .expires_in(86400L) // 24 horas
                    .build();

            log.info("Login OTP bem-sucedido para usuário: {} (Telefone: {})", usuario.getId(), telefone);
            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            log.warn("Erro ao validar código OTP para {}: {}", telefone, e.getReason());
            throw e;
        } catch (Exception e) {
            log.error("Erro inesperado ao validar código OTP: {}", e.getMessage(), e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao processar solicitação. Tente novamente"
            );
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        if (principal instanceof String principalString) {
            return principalString;
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não foi possível identificar o usuário autenticado");
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
