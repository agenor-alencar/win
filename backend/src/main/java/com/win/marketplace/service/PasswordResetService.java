package com.win.marketplace.service;

import com.win.marketplace.dto.request.PasswordResetConfirmDTO;
import com.win.marketplace.dto.request.PasswordResetRequestDTO;
import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.model.PasswordResetToken;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.PasswordResetTokenRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void solicitarResetSenha(PasswordResetRequestDTO request) {
        log.info("Solicitação de reset de senha para email: {}", request.email());

        // Buscar usuário
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.warn("Tentativa de reset para email não cadastrado: {}", request.email());
                    // Por segurança, não revelamos que o email não existe
                    return new BusinessException("Se o email existir, você receberá instruções para reset");
                });

        // Verificar se usuário está ativo
        if (!usuario.getAtivo()) {
            log.warn("Tentativa de reset para usuário inativo: {}", request.email());
            throw new BusinessException("Usuário inativo. Entre em contato com o suporte.");
        }

        // Invalidar tokens anteriores do usuário
        tokenRepository.invalidateAllTokensForUsuario(usuario);

        // Gerar novo token
        String token = UUID.randomUUID().toString();
        ZonedDateTime expiraEm = ZonedDateTime.now().plusHours(1);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .token(token)
                .expiraEm(expiraEm)
                .usado(false)
                .criadoEm(ZonedDateTime.now())
                .build();

        tokenRepository.save(resetToken);

        // Enviar email
        try {
            emailService.enviarEmailResetSenha(
                    usuario.getEmail(),
                    usuario.getNome(),
                    token
            );
            log.info("Email de reset enviado com sucesso para: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Erro ao enviar email de reset: {}", e.getMessage(), e);
            throw new BusinessException("Erro ao enviar email. Tente novamente mais tarde.");
        }
    }

    @Transactional
    public void resetarSenha(PasswordResetConfirmDTO request) {
        log.info("Tentativa de reset de senha com token");

        // Buscar token
        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> {
                    log.warn("Token inválido usado: {}", request.token());
                    return new BusinessException("Token inválido ou expirado");
                });

        // Validar token
        if (!resetToken.isValido()) {
            log.warn("Token expirado ou já usado: {}", request.token());
            throw new BusinessException("Token inválido ou expirado");
        }

        // Atualizar senha do usuário
        Usuario usuario = resetToken.getUsuario();
        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);

        // Marcar token como usado
        resetToken.setUsado(true);
        resetToken.setUsadoEm(ZonedDateTime.now());
        tokenRepository.save(resetToken);

        log.info("Senha resetada com sucesso para usuário: {}", usuario.getEmail());
    }

    @Transactional
    public void validarToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Token inválido"));

        if (!resetToken.isValido()) {
            throw new BusinessException("Token expirado ou já utilizado");
        }
    }

    // Limpar tokens expirados e usados a cada 6 horas
    @Scheduled(fixedRate = 21600000) // 6 horas em milissegundos
    @Transactional
    public void limparTokensExpirados() {
        log.info("Iniciando limpeza de tokens expirados");
        tokenRepository.deleteExpiredAndUsedTokens(ZonedDateTime.now());
        log.info("Limpeza de tokens concluída");
    }
}
