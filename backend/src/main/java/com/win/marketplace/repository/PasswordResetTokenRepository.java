package com.win.marketplace.repository;

import com.win.marketplace.model.PasswordResetToken;
import com.win.marketplace.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUsuarioAndUsadoFalseAndExpiraEmAfter(
            Usuario usuario,
            ZonedDateTime now
    );

    @Modifying
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiraEm < :now OR p.usado = true")
    void deleteExpiredAndUsedTokens(ZonedDateTime now);

    @Modifying
    @Query("UPDATE PasswordResetToken p SET p.usado = true WHERE p.usuario = :usuario AND p.usado = false")
    void invalidateAllTokensForUsuario(Usuario usuario);
}
