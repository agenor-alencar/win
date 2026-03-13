package com.win.marketplace.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final class AttemptState {
        private int failures;
        private Instant blockedUntil;
    }

    private final Map<String, AttemptState> attempts = new ConcurrentHashMap<>();

    @Value("${security.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${security.login.lock-minutes:15}")
    private long lockMinutes;

    public String buildKey(String email, String ip) {
        String normalizedEmail = email == null ? "unknown" : email.trim().toLowerCase();
        String normalizedIp = ip == null || ip.isBlank() ? "unknown-ip" : ip.trim();
        return normalizedEmail + "|" + normalizedIp;
    }

    public boolean isBlocked(String key) {
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
        AttemptState state = attempts.get(key);
        if (state == null || state.blockedUntil == null) {
            return 0;
        }
        Duration remaining = Duration.between(Instant.now(), state.blockedUntil);
        return Math.max(remaining.getSeconds(), 0);
    }

    public void registerFailure(String key) {
        AttemptState state = attempts.computeIfAbsent(key, k -> new AttemptState());
        state.failures++;
        if (state.failures >= maxAttempts) {
            state.blockedUntil = Instant.now().plus(Duration.ofMinutes(lockMinutes));
        }
    }

    public void registerSuccess(String key) {
        attempts.remove(key);
    }
}
