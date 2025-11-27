package com.win.marketplace.config;

import com.win.marketplace.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // Importar Value
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
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // 🚨 CORREÇÃO AQUI: Injeta a string de origens diretamente do ambiente/propriedades
    @Value("${ALLOWED_ORIGINS:http://localhost:3000,http://127.0.0.1:3000}")
    private String allowedOriginsString; // Mude o nome para evitar conflito com a lista

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Divide a string em uma lista de origens
        List<String> allowedOriginsList = Arrays.asList(allowedOriginsString.split(","));
        
        configuration.setAllowedOrigins(allowedOriginsList); // Define as origens permitidas
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*")); // Headers podem ser *
        configuration.setAllowCredentials(true); // Se true, setAllowedOrigins não pode ser "*"
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (não requerem autenticação)
                // Incluindo a duplicação do /api/v1/ do Nginx
                .requestMatchers("/api/api/v1/auth/login", "/api/api/v1/auth/login/**", "/api/api/v1/auth/register").permitAll()
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/login/**", "/api/v1/auth/register").permitAll()

                .requestMatchers("/api/api/v1/password-reset/**").permitAll()
                .requestMatchers("/api/v1/password-reset/**").permitAll()

                .requestMatchers("/api/api/v1/dev/**").permitAll()
                .requestMatchers("/api/v1/dev/**").permitAll()

                .requestMatchers("/api/api/v1/produtos/**").permitAll()
                .requestMatchers("/api/v1/produtos/**").permitAll()

                .requestMatchers("/api/api/v1/categoria/**").permitAll()
                .requestMatchers("/api/v1/categoria/**").permitAll()

                .requestMatchers("/api/api/v1/external/**").permitAll()
                .requestMatchers("/api/v1/external/**").permitAll()

                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/actuator/**").permitAll() // Actuator é útil, melhor deixar público por enquanto

                // Endpoints administrativos (apenas ADMIN)
                .requestMatchers("/api/v1/auth/promote-to-admin").hasAuthority("ADMIN")
                .requestMatchers("/api/api/v1/auth/promote-to-admin").hasAuthority("ADMIN") // Cobertura para duplicação

                // Todos os outros endpoints requerem autenticação
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}