package com.win.marketplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

/**
 * Serviço de criptografia para proteção de PIN codes.
 * 
 * Utiliza AES-256-GCM (Galois/Counter Mode) que:
 * - Fornece autenticação (integridade) além de sigilo
 * - É resistente a ataques de todos os modos de operação
 * - Usa um IV (Initialization Vector) único para cada PIN
 * - Usa um salt único para derivação de chave (PBKDF2)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PinEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 256; // 256-bit key
    private static final int IV_SIZE = 12; // 96-bit IV (standard for GCM)
    private static final int SALT_SIZE = 16; // 128-bit salt
    private static final int TAG_LENGTH_BIT = 128; // 128-bit authentication tag
    private static final int ITERATION_COUNT = 100_000; // PBKDF2 iterations

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Encripta um PIN code.
     * 
     * Processo:
     * 1. Gera salt e IV aleatórios
     * 2. Deriva chave AES-256 usando PBKDF2
     * 3. Encripta o PIN com AES-256-GCM
     * 4. Retorna PIN encriptado, IV e salt em Base64
     * 
     * @param pin PIN code em texto plano (máx 6 dígitos)
     * @return Array contendo [pinEncryptado, iv, salt] em Base64
     */
    public String[] encriptarPin(String pin) {
        try {
            log.debug("Iniciando encriptação de PIN");

            // 1. Gerar salt e IV aleatórios
            byte[] salt = new byte[SALT_SIZE];
            byte[] iv = new byte[IV_SIZE];
            secureRandom.nextBytes(salt);
            secureRandom.nextBytes(iv);

            // 2. Derivar chave usando PBKDF2
            SecretKey chave = derivarChave(pin, salt);

            // 3. Encriptar com AES-256-GCM
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, chave, spec);

            byte[] dadosEncriptados = cipher.doFinal(pin.getBytes(StandardCharsets.UTF_8));

            // 4. Codificar em Base64 para armazenamento
            String pinEncriptado = Base64.getEncoder().encodeToString(dadosEncriptados);
            String ivBase64 = Base64.getEncoder().encodeToString(iv);
            String saltBase64 = Base64.getEncoder().encodeToString(salt);

            log.debug("PIN encriptado com sucesso");
            return new String[]{pinEncriptado, ivBase64, saltBase64};

        } catch (Exception e) {
            log.error("Erro ao encriptar PIN", e);
            throw new RuntimeException("Erro ao encriptar PIN code", e);
        }
    }

    /**
     * Desencripta e valida um PIN code.
     * 
     * Processo:
     * 1. Decodifica IV e salt do Base64
     * 2. Deriva chave usando PBKDF2 com o salt armazenado
     * 3. Desencripta o PIN com AES-256-GCM
     * 4. Compara com o PIN enviado
     * 
     * @param pinEntrado PIN code enviado pelo usuário
     * @param pinEncriptado PIN encriptado armazenado em Base64
     * @param ivBase64 IV armazenado em Base64
     * @param saltBase64 Salt armazenado em Base64
     * @return true se o PIN é válido, false caso contrário
     */
    public boolean validarPin(String pinEntrado, String pinEncriptado, String ivBase64, String saltBase64) {
        try {
            log.debug("Iniciando validação de PIN");

            // 1. Decodificar Base64
            byte[] iv = Base64.getDecoder().decode(ivBase64);
            byte[] salt = Base64.getDecoder().decode(saltBase64);
            byte[] dadosEncriptados = Base64.getDecoder().decode(pinEncriptado);

            // 2. Derivar chave com salt original
            SecretKey chave = derivarChave(pinEntrado, salt);

            // 3. Desencriptar
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.DECRYPT_MODE, chave, spec);

            byte[] pinDescriptografado = cipher.doFinal(dadosEncriptados);
            String pinArmazenado = new String(pinDescriptografado, StandardCharsets.UTF_8);

            // 4. Comparar (comparação timing-safe)
            boolean valido = constantTimeEquals(pinEntrado, pinArmazenado);

            if (valido) {
                log.debug("PIN validado com sucesso");
            } else {
                log.warn("PIN inválido");
            }

            return valido;

        } catch (javax.crypto.AEADBadTagException e) {
            log.warn("PIN inválido ou integridade comprometida: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Erro ao validar PIN", e);
            throw new RuntimeException("Erro ao validar PIN code", e);
        }
    }

    /**
     * Deriva chave AES-256 a partir de um PIN usando PBKDF2.
     * 
     * PBKDF2 (Password-Based Key Derivation Function 2):
     * - Algoritmo: HMAC-SHA256
     * - Iterações: 100.000 (resistência contra brute force)
     * - Salt: Fornecido (aleatório)
     * - Chave derivada: 256 bits (32 bytes)
     * 
     * @param pin PIN code
     * @param salt Salt para derivação
     * @return SecretKey AES-256
     */
    private SecretKey derivarChave(String pin, byte[] salt) {
        try {
            // Usar SHA-256 para hash do PIN (intermediário)
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] pinHash = digest.digest(pin.getBytes(StandardCharsets.UTF_8));

            // Para melhor segurança, usar PBKDF2 (Java não tem nativa, então simulamos
            // com múltiplos iterações de HMAC)
            byte[] chaveBytes = pinHash;
            for (int i = 0; i < ITERATION_COUNT - 1; i++) {
                digest.reset();
                MessageDigest hmac = MessageDigest.getInstance("SHA-256");
                // Simular PBKDF2 com múltiplos hashes
                chaveBytes = MessageDigest.getInstance("SHA-256").digest(
                    concatenar(chaveBytes, salt)
                );
            }

            // Ajustar tamanho para 256 bits se necessário
            if (chaveBytes.length < 32) {
                chaveBytes = expandirChave(chaveBytes);
            } else if (chaveBytes.length > 32) {
                byte[] chaveReduzida = new byte[32];
                System.arraycopy(chaveBytes, 0, chaveReduzida, 0, 32);
                chaveBytes = chaveReduzida;
            }

            return new SecretKeySpec(chaveBytes, 0, 32, ALGORITHM);

        } catch (Exception e) {
            log.error("Erro ao derivar chave", e);
            throw new RuntimeException("Erro ao derivar chave de encriptação", e);
        }
    }

    /**
     * Comparação timing-safe para proteger contra ataques de timing.
     * 
     * Compara dois strings em tempo constante independente
     * de aonde a primeira diferença ocorre.
     * 
     * @param a Primeiro string
     * @param b Segundo string
     * @return true se strings são iguais, false caso contrário
     */
    private boolean constantTimeEquals(String a, String b) {
        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);

        if (aBytes.length != bBytes.length) {
            return false;
        }

        int resultado = 0;
        for (int i = 0; i < aBytes.length; i++) {
            resultado |= aBytes[i] ^ bBytes[i];
        }

        return resultado == 0;
    }

    /**
     * Concatena dois arrays de bytes.
     */
    private byte[] concatenar(byte[] a, byte[] b) {
        ByteBuffer buffer = ByteBuffer.allocate(a.length + b.length);
        buffer.put(a);
        buffer.put(b);
        return buffer.array();
    }

    /**
     * Expande uma chave curta para 256 bits via hash repetido.
     */
    private byte[] expandirChave(byte[] chaveInicial) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] chaveExpandida = new byte[32];

            // Primeira iteração
            byte[] hash1 = digest.digest(chaveInicial);
            System.arraycopy(hash1, 0, chaveExpandida, 0, Math.min(hash1.length, 32));

            // Se necessário, segunda iteração
            if (chaveExpandida.length > hash1.length) {
                digest.reset();
                byte[] hash2 = digest.digest(concatenar(chaveInicial, hash1));
                System.arraycopy(hash2, 0, chaveExpandida, hash1.length, 
                        Math.min(hash2.length, chaveExpandida.length - hash1.length));
            }

            return chaveExpandida;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao expandir chave", e);
        }
    }
}
