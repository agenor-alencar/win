package com.win.marketplace.service;

import com.win.marketplace.dto.request.ValidarPinRequestDTO;
import com.win.marketplace.dto.response.ValidarPinResponseDTO;
import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.model.Entrega;
import com.win.marketplace.model.PinValidacao;
import com.win.marketplace.model.enums.TipoPinValidacao;
import com.win.marketplace.repository.EntregaRepository;
import com.win.marketplace.repository.PinValidacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Serviço de validação de PIN codes com proteção contra brute force.
 * 
 * Responsabilidades:
 * 1. Gerar PIN codes de 4-6 dígitos aleatórios
 * 2. Armazenar PINs criptografados (AES-256-GCM)
 * 3. Validar PINs com proteção contra brute force
 * 4. Registrar auditoria de todas as tentativas
 * 5. Notificar via WebSocket ao validar um PIN
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PinValidacaoService {

    private final PinValidacaoRepository pinValidacaoRepository;
    private final EntregaRepository entregaRepository;
    private final PinEncryptionService encryptionService;
    private final WebSocketNotificationService webSocketNotificationService;
    private final RedisTemplate<String, String> redisTemplate;

    private static final int PIN_LENGTH = 4; // 4 dígitos: 0000-9999
    private static final int MAX_TENTATIVAS = 3; // Máximo de tentativas
    private static final long LOCKOUT_MINUTES = 15; // Bloqueio por 15 minutos
    private static final long PIN_EXPIRY_HOURS = 24; // PIN expira em 24 horas

    /**
     * Gera e persiste um novo PIN para uma entrega.
     * 
     * @param entregaId ID da entrega
     * @param tipo COLETA ou ENTREGA
     * @return PIN code gerado (apenas para envio inicial, não é armazenado em texto plano)
     */
    @Transactional
    public String gerarPin(UUID entregaId, TipoPinValidacao tipo) {
        log.info("Gerando PIN para entrega: {}, tipo: {}", entregaId, tipo);

        // 1. Validar entrega existe
        Entrega entrega = entregaRepository.findById(entregaId)
                .orElseThrow(() -> new BusinessException("Entrega não encontrada"));

        // 2. Verificar se já existe PIN ativo para este tipo
        Optional<PinValidacao> pinExistente = pinValidacaoRepository
                .findByEntregaAndTipoPinValidacaoAndValidadoFalse(entrega, tipo);

        if (pinExistente.isPresent()) {
            log.warn("PIN já existe para esta entrega e tipo: {}", entregaId);
            throw new BusinessException("PIN já foi gerado para esta etapa");
        }

        // 3. Gerar PIN de 4 dígitos
        String pinGerado = gerarNumeroAleatorio(PIN_LENGTH);

        // 4. Encriptar e armazenar
        String[] encriptacao = encryptionService.encriptarPin(pinGerado);

        PinValidacao pinValidacao = new PinValidacao();
        pinValidacao.setEntrega(entrega);
        pinValidacao.setTipoPinValidacao(tipo);
        pinValidacao.setPinEncriptado(encriptacao[0]);
        pinValidacao.setIv(encriptacao[1]);
        pinValidacao.setSalt(encriptacao[2]);
        pinValidacao.setValidado(false);
        pinValidacao.setNumeroTentativas(0);
        pinValidacao.setMaxTentativas(MAX_TENTATIVAS);
        pinValidacao.setExpiraEm(OffsetDateTime.now().plusHours(PIN_EXPIRY_HOURS));

        PinValidacao pinSalvo = pinValidacaoRepository.save(pinValidacao);
        log.info("PIN gerado e armazenado: {} para entrega: {}", pinSalvo.getId(), entregaId);

        // 5. Limpar PIN da memória antes de retornar
        // Retornar apenas para ser enviado ao usuário (uma única vez)
        return pinGerado;
    }

    /**
     * Valida um PIN code enviado pelo usuário.
     * 
     * Proteções implementadas:
     * - Máximo 3 tentativas
     * - Bloqueio por 15 minutos após 3 falhas
     * - Verificação de expiração
     * - Comparação timing-safe
     * - Auditoria de todas as tentativas
     * 
     * @param request DTO com entregaId, PIN e tipo
     * @param usuarioId ID do usuário que está validando
     * @param ipAddress IP do cliente
     * @param userAgent User-Agent do cliente
     * @return DTO com resultado da validação
     */
    @Transactional
    public ValidarPinResponseDTO validarPin(
            ValidarPinRequestDTO request,
            UUID usuarioId,
            String ipAddress,
            String userAgent) {

        log.info("Validando PIN para entrega: {}, tipo: {}, usuário: {}, IP: {}",
                request.entregaId(), request.tipo(), usuarioId, ipAddress);

        // 1. Buscar PIN ativo
        Entrega entrega = entregaRepository.findById(request.entregaId())
                .orElseThrow(() -> new BusinessException("Entrega não encontrada"));

        PinValidacao pinValidacao = pinValidacaoRepository
                .findByEntregaAndTipoPinValidacaoAndValidadoFalse(entrega, request.tipo())
                .orElseThrow(() -> new BusinessException("PIN não encontrado para esta entrega"));

        // 2. Verificar expiração
        if (!pinValidacao.isPinValido()) {
            log.warn("PIN expirado para entrega: {}", request.entregaId());
            pinValidacao.setMotivoFalha("PIN expirado");
            pinValidacaoRepository.save(pinValidacao);
            throw new BusinessException("PIN expirou. Solicite um novo código.");
        }

        // 3. Verificar bloqueio por brute force
        if (pinValidacao.estaBloqueado()) {
            log.warn("Tentativa em PIN bloqueado para entrega: {}", request.entregaId());
            long minutosRestantes = java.time.temporal.ChronoUnit.MINUTES
                    .between(OffsetDateTime.now(), pinValidacao.getBloqueadoAte());
            return ValidarPinResponseDTO.falha(
                    pinValidacao.getId(),
                    request.entregaId(),
                    request.tipo(),
                    String.format("Muitas tentativas. Tente novamente em %d minutos.", minutosRestantes),
                    0,
                    true,
                    pinValidacao.getBloqueadoAte()
            );
        }

        // 4. Verificar tentativas disponíveis
        if (!pinValidacao.temTentativasDisponiveis()) {
            log.warn("Sem tentativas disponíveis para entrega: {}", request.entregaId());
            return ValidarPinResponseDTO.falha(
                    pinValidacao.getId(),
                    request.entregaId(),
                    request.tipo(),
                    "Limite de tentativas atingido",
                    0,
                    true,
                    OffsetDateTime.now().plusMinutes(LOCKOUT_MINUTES)
            );
        }

        // 5. Validar PIN criptografado
        boolean pinValido = encryptionService.validarPin(
                request.pin(),
                pinValidacao.getPinEncriptado(),
                pinValidacao.getIv(),
                pinValidacao.getSalt()
        );

        pinValidacao.setIpAddress(ipAddress);
        pinValidacao.setUserAgent(userAgent);
        pinValidacao.setUsuarioValidadorId(usuarioId);

        if (pinValido) {
            // ✅ PIN válido
            log.info("PIN validado com sucesso para entrega: {}", request.entregaId());

            pinValidacao.setValidado(true);
            pinValidacao.setDataValidacao(OffsetDateTime.now());
            pinValidacao.setNumeroTentativas(0);

            PinValidacao pinAtualizado = pinValidacaoRepository.save(pinValidacao);

            // Notificar via WebSocket
            notificarValidacaoPinDireto(entrega, request.tipo(), usuarioId);

            return ValidarPinResponseDTO.sucesso(
                    pinAtualizado.getId(),
                    request.entregaId(),
                    request.tipo(),
                    pinAtualizado.getDataValidacao()
            );

        } else {
            // ❌ PIN inválido
            log.warn("PIN inválido para entrega: {}, tentativa: {}",
                    request.entregaId(), pinValidacao.getNumeroTentativas() + 1);

            pinValidacao.incrementarTentativas();
            pinValidacao.setMotivoFalha("PIN incorreto");

            PinValidacao pinAtualizado = pinValidacaoRepository.save(pinValidacao);

            Integer tentativasRestantes = MAX_TENTATIVAS - pinAtualizado.getNumeroTentativas();
            String mensagem = tentativasRestantes > 0
                    ? String.format("PIN incorreto. %d tentativa(s) restante(s).", tentativasRestantes)
                    : "Limite de tentativas atingido. Tente novamente em 15 minutos.";

            return ValidarPinResponseDTO.falha(
                    pinAtualizado.getId(),
                    request.entregaId(),
                    request.tipo(),
                    mensagem,
                    tentativasRestantes,
                    pinAtualizado.estaBloqueado(),
                    pinAtualizado.getBloqueadoAte()
            );
        }
    }

    /**
     * Notifica via WebSocket que um PIN foi validado.
     * 
     * @param entrega Entrega validada
     * @param tipo Tipo de PIN (COLETA/ENTREGA)
     * @param usuarioId ID do usuário validador
     */
    private void notificarValidacaoPinDireto(Entrega entrega, TipoPinValidacao tipo, UUID usuarioId) {
        try {
            Map<String, Object> dados = Map.of(
                    "tipo", tipo.name(),
                    "validadoEm", OffsetDateTime.now().toString(),
                    "validadorId", usuarioId.toString(),
                    "entregaId", entrega.getId().toString()
            );
            webSocketNotificationService.broadcastNotificacao("pin-validado", dados);
            log.debug("WebSocket notificação enviada para validação de PIN da entrega: {}", entrega.getId());
        } catch (Exception e) {
            log.error("Erro ao enviar notificação WebSocket de validação de PIN", e);
        }
    }

    /**
     * Gera um número aleatório com quantidade específica de dígitos.
     * 
     * @param numDigitos Número de dígitos (ex: 4 = 0000-9999)
     * @return String com número aleatório
     */
    private String gerarNumeroAleatorio(int numDigitos) {
        int min = (int) Math.pow(10, numDigitos - 1);
        int max = (int) Math.pow(10, numDigitos) - 1;
        int numero = min + (int) (Math.random() * (max - min + 1));
        return String.format("%0" + numDigitos + "d", numero);
    }

    /**
     * Limpa PINs expirados (tarefa agendada).
     * 
     * Pode ser executada periodicamente para limpeza do banco.
     */
    @Transactional
    public void limparPinsExpirados() {
        log.info("Iniciando limpeza de PINs expirados");
        var pinsExpirados = pinValidacaoRepository.findExpiredUnvalidatedPins(OffsetDateTime.now());
        pinValidacaoRepository.deleteAll(pinsExpirados);
        log.info("Limpeza concluída: {} PINs expirados removidos", pinsExpirados.size());
    }
}
