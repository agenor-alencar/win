package com.win.marketplace.config;

import com.win.marketplace.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuração de segurança do Spring Security com JWT
 * Define o PasswordEncoder, CORS, filtro JWT e proteção de endpoints
 * 
 * @EnableMethodSecurity permite uso de anotações @PreAuthorize nos métodos
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Bean do PasswordEncoder para criptografia de senhas
     * Usa BCrypt com strength padrão (10)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configuração de CORS para permitir requisições do frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configuração de segurança com JWT
     * Define quais endpoints são públicos e quais requerem autenticação
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (não requerem autenticação)
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/login/**", "/api/v1/auth/register").permitAll()
                .requestMatchers("/api/v1/password-reset/**").permitAll() // Reset de senha público
                .requestMatchers("/api/v1/produtos/**").permitAll() // Permitir listagem pública de produtos
                .requestMatchers("/api/v1/categoria/**").permitAll() // Permitir listagem pública de categorias
                .requestMatchers("/api/v1/external/**").permitAll() // Permitir consulta de CNPJ e CEP
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Swagger público
                .requestMatchers("/error").permitAll()
                
                // Endpoints administrativos (apenas ADMIN)
                .requestMatchers("/api/v1/auth/promote-to-admin").hasAuthority("ADMIN")
                
                // Todos os outros endpoints requerem autenticação
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
