package com.win.marketplace.repository;

import com.win.marketplace.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository para entidade OtpToken
 * Responsável por operações de persistência de tokens OTP
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {

    /**
     * Encontra o OTP válido mais recente para um número de telefone específico
     * Critério: válido=true e expiracao > now()
     * 
     * @param telefone Número de telefone formatado (+5511999999999)
     * @return Optional contendo o token OTP válido mais recente, se existir
     */
    @Query(value = 
        "SELECT * FROM otp_tokens " +
        "WHERE telefone = :telefone AND valido = true AND expiracao > NOW() " +
        "ORDER BY criado_em DESC LIMIT 1",
        nativeQuery = true
    )
    Optional<OtpToken> findLatestValidOtpByTelefone(@Param("telefone") String telefone);

    /**
     * Encontra todos os OTPs válidos para um número de telefone
     * Utilizado para invalidar múltiplos tokens ao validar um código
     * 
     * @param telefone Número de telefone formatado
     * @return Lista de tokens OTP válidos para o telefone
     */
    @Query(value =
        "SELECT * FROM otp_tokens " +
        "WHERE telefone = :telefone AND valido = true AND expiracao > NOW():",
        nativeQuery = true
    )
    List<OtpToken> findAllValidOtpsByTelefone(@Param("telefone") String telefone);

    /**
     * Encontra todos os OTPs expirados
     * Utilizado pelo scheduler de limpeza para remover dados antigos
     * 
     * @return Lista de tokens OTP expirados
     */
    @Query(value =
        "SELECT * FROM otp_tokens " +
        "WHERE expiracao <= NOW()",
        nativeQuery = true
    )
    List<OtpToken> findAllExpiredOtps();

    /**
     * Conta quantos OTPs válidos foram solicitados emum timeframe específico
     * Utilizado para implementar rate limiting de solicitações SMS
     * 
     * Exemplo: "Quantos OTPs foram solicitados para este telefone nos últimos 10 minutos?"
     * 
     * @param telefone Número de telefone formatado
     * @param since Data/hora de início do período
     * @return Quantidade de OTPs solicitados no período
     */
    @Query(value =
        "SELECT COUNT(*) FROM otp_tokens " +
        "WHERE telefone = :telefone AND criado_em >= :since",
        nativeQuery = true
    )
    Integer countOtpsRequestedSince(@Param("telefone") String telefone, @Param("since") OffsetDateTime since);

    /**
     * Invalida todos os OTPs válidos para um telefone
     * Executado quando o usuário valida um código com sucesso
     * Garante que o mesmo código não possa ser usado duas vezes
     * 
     * @param telefone Número de telefone formatado
     */
    @Modifying
    @Transactional
    @Query(value =
        "UPDATE otp_tokens SET valido = false, atualizado_em = NOW() " +
        "WHERE telefone = :telefone AND valido = true",
        nativeQuery = true
    )
    void invalidateAllValidOtpsForTelefone(@Param("telefone") String telefone);

    /**
     * Remove todos os OTPs expirados do banco de dados
     * Executado periodicamente para manter a performance e reduzir espaço em disco
     * 
     * @return Número de registros deletados
     */
    @Modifying
    @Transactional
    @Query(value =
        "DELETE FROM otp_tokens WHERE expiracao <= NOW()",
        nativeQuery = true
    )
    Integer deleteAllExpiredOtps();

    /**
     * Verifica se existe um OTP válido para um telefone e código específico
     * Utilizado para evitar contagem desnecessária de tentativas
     * 
     * @param telefone Número de telefone
     * @param codigo Código OTP
     * @return true se existe um OTP válido com o código fornecido
     */
    @Query(value =
        "SELECT COUNT(*) > 0 FROM otp_tokens " +
        "WHERE telefone = :telefone AND codigo = :codigo AND valido = true AND expiracao > NOW()",
        nativeQuery = true
    )
    Boolean existsValidOtpByTelefoneAndCodigo(@Param("telefone") String telefone, @Param("codigo") String codigo);
}
