package com.win.marketplace.service;

import com.win.marketplace.dto.response.OtpResponseDTO;
import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.model.OtpToken;
import com.win.marketplace.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Serviço de gerenciamento de OTPs (One-Time Passwords)
 * 
 * Responsabilidades:
 * - Gerar códigos OTP aleatórios de 6 dígitos
 * - Persistir OTPs no banco com TTL de 5 minutos
 * - Validar códigos OTP fornecidos pelos usuários
 * - Invalidar códigos após uso bem-sucedido
 * - Rastrear tentativas de validação
 * - Fornecer dados para rate limiting
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;

    @Value("${otp.expiration-minutes:5}")
    private Integer otpExpirationMinutes;

    @Value("${otp.max-attempts:3}")
    private Integer maxAttempts;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Gera um novo código OTP para um telefone
     * 
     * Processo:
     * 1. Gera código numérico aleatório de 6 dígitos (000000 a 999999)
     * 2. Calcula data de expiração (5 minutos a partir de agora)
     * 3. Persiste no banco de dados
     * 4. Retorna o código para ser enviado via SMS
     * 
     * @param telefone Número de telefone formatado (+5511999999999)
     * @return O código OTP gerado (ex: "123456")
     * @throws Exception Se houver erro ao persistir no banco
     */
    @Transactional
    public String gerarCodigoOtp(String telefone) {
        log.info("Gerando novo código OTP para telefone: {}", telefone);

        // 1. Gerar código aleatório de 6 dígitos
        String codigo = String.format("%06d", RANDOM.nextInt(1000000));
        log.debug("Código OTP gerado: {}", codigo);

        // 2. Calcular data de expiração (5 minutos)
        OffsetDateTime expiracao = OffsetDateTime.now().plusMinutes(otpExpirationMinutes);

        // 3. Criar e persistir token OTP
        OtpToken otpToken = OtpToken.builder()
                .telefone(telefone)
                .codigo(codigo)
                .tentativas(0)
                .valido(true)
                .expiracao(expiracao)
                .build();

        otpTokenRepository.save(otpToken);
        log.info("Código OTP salvo no banco para telefone: {} com expiração em: {}", telefone, expiracao);

        return codigo;
    }

    /**
     * Valida um código OTP fornecido pelo usuário
     * 
     * Validações:
     * 1. Verificar se existe um OTP válido para o telefone
     * 2. Confirmar que o código matches
     * 3. Verificar se não expirou
     * 4. Confirmar que não atingiu limite de tentativas
     * 
     * Se bem-sucedido:
     * - Invalida o código (marca como usado)
     * 
     * Se erro:
     * - Incrementa contador de tentativas
     * - Lança BusinessException com mensagem apropriada
     * 
     * @param telefone Número de telefone
     * @param codigo Código OTP fornecido pelo usuário
     * @return true se o código é válido
     * @throws ResponseStatusException (401) se código inválido/expirado
     */
    @Transactional
    public boolean validarCodigoOtp(String telefone, String codigo) {
        log.info("Validando código OTP para telefone: {}", telefone);

        // 1. Buscar OTP válido mais recente
        Optional<OtpToken> otpOptional = otpTokenRepository.findLatestValidOtpByTelefone(telefone);

        if (otpOptional.isEmpty()) {
            log.warn("Nenhum OTP válido encontrado para telefone: {}", telefone);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Código inválido ou expirado"
            );
        }

        OtpToken otpToken = otpOptional.get();

        // 2. Verificar se não expirou
        if (!otpToken.isNotExpired()) {
            log.warn("OTP expirado para telefone: {} - expiração: {}", telefone, otpToken.getExpiracao());
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Código inválido ou expirado"
            );
        }

        // 3. Verificar limite de tentativas
        if (otpToken.getTentativas() >= maxAttempts) {
            log.warn("Limite de tentativas atingido para telefone: {} (tentativas: {})",
                    telefone, otpToken.getTentativas());
            // Invalidar para forçar novo código
            otpToken.setValido(false);
            otpTokenRepository.save(otpToken);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Código inválido ou expirado. Solicite um novo código"
            );
        }

        // 4. Verificar se código bate
        if (!otpToken.getCodigo().equals(codigo)) {
            log.warn("Código incorreto para telefone: {} (tentativa: {})",
                    telefone, otpToken.getTentativas() + 1);
            otpToken.incrementTentativas();
            otpTokenRepository.save(otpToken);

            // Verificar se atingiu limite após incremento
            if (otpToken.getTentativas() >= maxAttempts) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Código inválido. Limite de tentativas atingido. Solicite um novo código"
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Código inválido ou expirado"
            );
        }

        // ✅ Código validado com sucesso!
        log.info("Código OTP validado com sucesso para telefone: {}", telefone);

        // Invalidar esse OTP e todos os outros válidos para esse telefone
        otpTokenRepository.invalidateAllValidOtpsForTelefone(telefone);

        return true;
    }

    /**
     * Retorna informações de resposta para solicitação de OTP bem-sucedida
     * 
     * @param telefone Número de telefone
     * @return DTO com informações de sucesso
     */
    public OtpResponseDTO construirRespostaSucesso(String telefone) {
        return OtpResponseDTO.sucesso(telefone, otpExpirationMinutes * 60);
    }

    /**
     * Conta quantos OTPs foram solicitados para um telefone em um período
     * Utilizado para rate limiting
     * 
     * @param telefone Número de telefone
     * @param minutosAtras Número de minutos a olhar para trás
     * @return Quantidade de OTPs solicitados no período
     */
    public Integer contarOtpsNoUltimosPeriodo(String telefone, Integer minutosAtras) {
        OffsetDateTime since = OffsetDateTime.now().minusMinutes(minutosAtras);
        return otpTokenRepository.countOtpsRequestedSince(telefone, since);
    }

    /**
     * Verifica se um telefone pode solicitar novo OTP
     * Implementa rate limiting: máximo 3 solicitações por minuto
     * 
     * @param telefone Número de telefone
     * @return true se pode solicitar, false se deve esperar
     */
    public boolean podesolicitarNovoOtp(String telefone) {
        Integer otpsSolicitadosNoUltimoMinuto = contarOtpsNoUltimosPeriodo(telefone, 1);
        return otpsSolicitadosNoUltimoMinuto < 3;
    }
}
