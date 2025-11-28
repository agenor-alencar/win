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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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
        
        // Permite localhost para desenvolvimento e IP/domínio da VPS para produção
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        List<String> allowedOrigins = new ArrayList<>();
        
        // Origens padrão para desenvolvimento local
        allowedOrigins.add("http://localhost:3000");
        allowedOrigins.add("http://127.0.0.1:3000");
        allowedOrigins.add("http://localhost:3001");
        allowedOrigins.add("http://127.0.0.1:3001");
        
        // Origens VPS (IP e domínio, todas as portas comuns)
        allowedOrigins.add("http://137.184.87.106");
        allowedOrigins.add("http://137.184.87.106:80");
        allowedOrigins.add("http://137.184.87.106:3000");
        allowedOrigins.add("http://winmarketplace.com.br");
        allowedOrigins.add("https://winmarketplace.com.br");
        
        // Adiciona origens personalizadas da variável de ambiente ALLOWED_ORIGINS
        // Configure no .env: ALLOWED_ORIGINS=http://seu-ip,https://seu-dominio.com
        if (allowedOriginsEnv != null && !allowedOriginsEnv.trim().isEmpty()) {
            String[] origins = allowedOriginsEnv.split(",");
            for (String origin : origins) {
                allowedOrigins.add(origin.trim());
            }
        }
        
        configuration.setAllowedOrigins(allowedOrigins);
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
                .requestMatchers("/api/v1/dev/**").permitAll() // Dev Tools (gerador de hash)
                .requestMatchers("/api/v1/produtos/**").permitAll() // Permitir listagem pública de produtos
                .requestMatchers("/api/v1/categoria/**").permitAll() // Permitir listagem pública de categorias
                .requestMatchers("/api/v1/external/**").permitAll() // Permitir consulta de CNPJ e CEP
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Swagger público
                .requestMatchers("/error").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                
                // Endpoints administrativos (apenas ADMIN)
                .requestMatchers("/api/v1/auth/promote-to-admin").hasAuthority("ADMIN")
                
                // Todos os outros endpoints requerem autenticação
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
