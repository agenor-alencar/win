package com.sistemawin.repository;

import com.sistemawin.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Encontra um usuário pelo email
    Optional<User> findByEmail(String email);

    // Verifica se um usuário com o dado email existe
    boolean existsByEmail(String email);
}
