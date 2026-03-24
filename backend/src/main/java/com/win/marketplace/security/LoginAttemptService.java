package com.win.marketplace.security;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final String FAILURES_KEY_PREFIX = "auth:failures:";
    private static final String BLOCK_KEY_PREFIX = "auth:block:";

    private static final class AttemptState {
        private int failures;
        private Instant blockedUntil;
    }

    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final Map<String, AttemptState> attempts = new ConcurrentHashMap<>();

    @Value("${security.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${security.login.lock-minutes:15}")
    private long lockMinutes;

    @Value("${security.login.use-redis:true}")
    private boolean useRedis;

    public String buildKey(String email, String ip) {
        String normalizedEmail = email == null ? "unknown" : email.trim().toLowerCase();
        String normalizedIp = ip == null || ip.isBlank() ? "unknown-ip" : ip.trim();
        return normalizedEmail + "|" + normalizedIp;
    }

    @SuppressWarnings("null")
    public boolean isBlocked(String key) {
        StringRedisTemplate redisTemplate = getRedisTemplate();
        if (redisTemplate != null) {
            String blockedUntil = redisTemplate.opsForValue().get(blockKey(key));
            if (blockedUntil == null) {
                return false;
            }

            long blockedUntilEpoch = Long.parseLong(blockedUntil);
            if (Instant.now().getEpochSecond() >= blockedUntilEpoch) {
                redisTemplate.delete(blockKey(key));
                return false;
            }
            return true;
        }

        AttemptState state = attempts.get(key);
        if (state == null || state.blockedUntil == null) {
            return false;
        }
        if (Instant.now().isAfter(state.blockedUntil)) {
            attempts.remove(key);
            return false;
        }
        return true;
    }

    public long blockedSecondsRemaining(String key) {
        StringRedisTemplate redisTemplate = getRedisTemplate();
        if (redisTemplate != null) {
            @SuppressWarnings("null")
            String blockedUntil = redisTemplate.opsForValue().get(blockKey(key));
            if (blockedUntil == null) {
                return 0;
            }

            long remaining = Long.parseLong(blockedUntil) - Instant.now().getEpochSecond();
            return Math.max(remaining, 0);
        }

        AttemptState state = attempts.get(key);
        if (state == null || state.blockedUntil == null) {
            return 0;
        }
        Duration remaining = Duration.between(Instant.now(), state.blockedUntil);
        return Math.max(remaining.getSeconds(), 0);
    }

    public void registerFailure(String key) {
        StringRedisTemplate redisTemplate = getRedisTemplate();
        if (redisTemplate != null) {
            @SuppressWarnings("null")
            Duration lockDuration = Duration.ofMinutes(lockMinutes);
            String failKey = failuresKey(key);

            @SuppressWarnings("null")
            Long failures = redisTemplate.opsForValue().increment(failKey);
            if (failures != null && failures == 1) {
                @SuppressWarnings("null")
                Boolean expireOk = redisTemplate.expire(failKey, lockDuration);
            }

            if (failures != null && failures >= maxAttempts) {
                long blockedUntilEpoch = Instant.now().plus(lockDuration).getEpochSecond();
                // Suppress null warnings for RedisTemplate operations - keys validated above
                redisTemplate.opsForValue().set(blockKey(key), String.valueOf(blockedUntilEpoch), lockDuration);
                redisTemplate.delete(failKey);
            }
            return;
        }

        AttemptState state = attempts.computeIfAbsent(key, k -> new AttemptState());
        state.failures++;
        if (state.failures >= maxAttempts) {
            state.blockedUntil = Instant.now().plus(Duration.ofMinutes(lockMinutes));
        }
    }

    public void registerSuccess(String key) {
        StringRedisTemplate redisTemplate = getRedisTemplate();
        if (redisTemplate != null) {
            redisTemplate.delete(failuresKey(key));
            redisTemplate.delete(blockKey(key));
            return;
        }

        attempts.remove(key);
    }

    private StringRedisTemplate getRedisTemplate() {
        if (!useRedis) {
            return null;
        }
        return redisTemplateProvider.getIfAvailable();
    }

    private String failuresKey(String key) {
        return FAILURES_KEY_PREFIX + key;
    }

    private String blockKey(String key) {
        return BLOCK_KEY_PREFIX + key;
    }
}
