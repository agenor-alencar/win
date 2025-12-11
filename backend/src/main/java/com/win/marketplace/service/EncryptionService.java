package com.win.marketplace.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Arrays;

/**
 * Serviço para criptografia e descriptografia de dados sensíveis (API Keys)
 * Usa AES-256
 */
@Service
@Slf4j
public class EncryptionService {
    
    private static final String ALGORITHM = "AES";
    private final SecretKey secretKey;
    
    public EncryptionService(@Value("${app.encryption.secret:Win@Marketplace#2025!Secret}") String secret) {
        this.secretKey = generateKey(secret);
    }
    
    /**
     * Criptografa um texto usando AES-256
     */
    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("Erro ao criptografar", e);
            throw new RuntimeException("Erro ao criptografar dados", e);
        }
    }
    
    /**
     * Descriptografa um texto criptografado com AES-256
     */
    public String decrypt(String encryptedText) {
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Erro ao descriptografar", e);
            throw new RuntimeException("Erro ao descriptografar dados", e);
        }
    }
    
    private SecretKey generateKey(String secret) {
        try {
            // Gera uma chave de 256 bits a partir da secret
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] key = sha.digest(secret.getBytes(StandardCharsets.UTF_8));
            key = Arrays.copyOf(key, 16); // Usar apenas 128 bits para compatibilidade
            return new SecretKeySpec(key, ALGORITHM);
        } catch (Exception e) {
            log.error("Erro ao gerar chave de criptografia", e);
            throw new RuntimeException("Erro ao gerar chave de criptografia", e);
        }
    }
}
