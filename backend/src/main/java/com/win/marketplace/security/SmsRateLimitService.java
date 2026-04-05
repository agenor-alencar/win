package com.win.marketplace.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço de Rate Limiting para solicitações de código OTP via SMS
 * 
 * Implementa o critério de aceite:
 * "Bloquear temporário caso o mesmo IP/Telefone solicite SMS mais de 3 vezes em menos de 1 minuto"
 * 
 * Usa Redis como backend principal (com fallback para Map em memória)
 * 
 * Estratégia:
 * - Máximo: 3 solicitações por minuto (para o mesmo IP + Telefone)
 * - Bloqueio: 60 segundos após atingir limite
 * - Chave de identificação: IP + Telefone
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmsRateLimitService {

    private static final String KEY_PREFIX = "sms:ratelimit:";
    private static final String BLOCK_PREFIX = "sms:blocked:";

    private static final class RequestState {
        private int requestCount;
        private Instant blockedUntil;
    }

    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final Map<String, RequestState> inMemoryRequests = new ConcurrentHashMap<>();

    @Value("${sms.ratelimit.max-requests:3}")
    private int maxRequests;

    @Value("${sms.ratelimit.window-minutes:1}")
    private int windowMinutes;

    @Value("${sms.ratelimit.block-minutes:1}")
    private int blockMinutes;

    @Value("${security.login.use-redis:true}")
    private boolean useRedis;

    /**
     * Gera chave única combinando IP do cliente e número de telefone
     * 
     * Exemplo: "192.168.1.1|+5511987654321"
     * 
     * @param ipCliente IP do cliente (extraído de HttpServletRequest)
     * @param telefone Número de telefone do usuário
     * @return Chave normalizada para rate limiting
     */
    public String construirChave(String ipCliente, String telefone) {
        String ipNormalizado = (ipCliente == null || ipCliente.isBlank()) ? "unknown-ip" : ipCliente.trim();
        String telefonNormalizado = (telefone == null || telefone.isBlank()) ? "unknown-phone" : telefone.trim();
        return ipNormalizado + "|" + telefonNormalizado;
    }

    /**
     * Verifica se uma requisição está bloqueada por rate limit
     * 
     * @param chave Chave construída com construirChave()
     * @return true se bloqueado, false caso contrário
     */
    public boolean estaBlockeado(String chave) {
        StringRedisTemplate redisTemplate = obterRedisTemplate();
        
        if (redisTemplate != null) {
            String blockedAtStr = redisTemplate.opsForValue().get(gerarChaveBloqueia(chave));
            
            if (blockedAtStr == null) {
                return false;
            }

            // Verificar se bloqueio expirou
            long blockedUntilEpoch = Long.parseLong(blockedAtStr);
            if (Instant.now().getEpochSecond() >= blockedUntilEpoch) {
                redisTemplate.delete(gerarChaveBloqueia(chave));
                return false;
            }

            return true;
        }

        // Fallback para Map em memória
        RequestState state = inMemoryRequests.get(chave);
        if (state == null || state.blockedUntil == null) {
            return false;
        }

        if (Instant.now().isAfter(state.blockedUntil)) {
            inMemoryRequests.remove(chave);
            return false;
        }

        return true;
    }

    /**
     * Retorna quantos segundos faltam para desbloquear
     * Útil para retornar na resposta de erro HTTP 429
     * 
     * @param chave Chave construída com construirChave()
     * @return Segundos restantes até desbloquear (0 se não bloqueado)
     */
    public long obterSegundosRestantes(String chave) {
        StringRedisTemplate redisTemplate = obterRedisTemplate();
        
        if (redisTemplate != null) {
            String blockedAtStr = redisTemplate.opsForValue().get(gerarChaveBloqueia(chave));
            
            if (blockedAtStr == null) {
                return 0;
            }

            long remaining = Long.parseLong(blockedAtStr) - Instant.now().getEpochSecond();
            return Math.max(remaining, 0);
        }

        // Fallback para Map em memória
        RequestState state = inMemoryRequests.get(chave);
        if (state == null || state.blockedUntil == null) {
            return 0;
        }

        Duration remaining = Duration.between(Instant.now(), state.blockedUntil);
        return Math.max(remaining.getSeconds(), 0);
    }

    /**
     * Registra uma nova solicitação de SMS e verifica se deve bloquear
     * 
     * Lógica:
     * 1. Contar requisições no período de 1 minuto
     * 2. Incrementar contador
     * 3. Se atingiu limite (3), bloquear por 60 segundos
     * 4. Retornar true se pode prosseguir, false se bloqueado
     * 
     * @param chave Chave construída com construirChave()
     * @return true se pode enviar SMS, false caso esteja bloqueado
     */
    public boolean registrarSolicitacao(String chave) {
        StringRedisTemplate redisTemplate = obterRedisTemplate();

        if (redisTemplate != null) {
            Duration janela = Duration.ofMinutes(windowMinutes);
            String countKey = gerarChaveContagem(chave);

            // Incrementar contador
            Long count = redisTemplate.opsForValue().increment(countKey);
            
            // Definir expiração na primeira requisição
            if (count != null && count == 1) {
                redisTemplate.expire(countKey, janela);
            }

            // Verificar se atingiu limite
            if (count != null && count > maxRequests) {
                log.warn("Rate limit SMS atingido para chave: {} (requisições: {})", chave, count);
                
                // Bloquear
                Duration bloqueio = Duration.ofMinutes(blockMinutes);
                long blockedUntilEpoch = Instant.now().plus(bloqueio).getEpochSecond();
                redisTemplate.opsForValue().set(
                        gerarChaveBloqueia(chave),
                        String.valueOf(blockedUntilEpoch),
                        bloqueio
                );

                return false;
            }

            return true;
        }

        // Fallback para Map em memória
        RequestState state = inMemoryRequests.computeIfAbsent(chave, k -> new RequestState());
        state.requestCount++;

        if (state.requestCount > maxRequests) {
            log.warn("Rate limit SMS atingido para chave: {} (requisições: {})", chave, state.requestCount);
            state.blockedUntil = Instant.now().plus(Duration.ofMinutes(blockMinutes));
            return false;
        }

        return true;
    }

    /**
     * Limpa a contagem de requisições para uma chave (normalmente após sucesso)
     * 
     * @param chave Chave construída com construirChave()
     */
    public void limparContagem(String chave) {
        StringRedisTemplate redisTemplate = obterRedisTemplate();

        if (redisTemplate != null) {
            redisTemplate.delete(gerarChaveContagem(chave));
            return;
        }

        inMemoryRequests.remove(chave);
    }

    /**
     * Reseta o rate limiting para uma chave (teste ou admin)
     * 
     * @param chave Chave construída com construirChave()
     */
    public void resetarRateLimit(String chave) {
        StringRedisTemplate redisTemplate = obterRedisTemplate();

        if (redisTemplate != null) {
            redisTemplate.delete(gerarChaveContagem(chave));
            redisTemplate.delete(gerarChaveBloqueia(chave));
            return;
        }

        inMemoryRequests.remove(chave);
    }

    // === Métodos privados ===

    private StringRedisTemplate obterRedisTemplate() {
        if (!useRedis) {
            return null;
        }
        return redisTemplateProvider.getIfAvailable();
    }

    private String gerarChaveContagem(String chave) {
        return KEY_PREFIX + "count:" + chave;
    }

    private String gerarChaveBloqueia(String chave) {
        return BLOCK_PREFIX + chave;
    }
}
