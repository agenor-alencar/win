package com.win.marketplace.config;

import com.win.marketplace.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
import java.util.stream.Collectors;

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

    @Value("${app.dev-tools.enabled:false}")
    private boolean devToolsEnabled;

    @Value("${app.api-docs.enabled:false}")
    private boolean apiDocsEnabled;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173}")
    private String allowedOriginsProperty;

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

        List<String> allowedOrigins = Arrays.stream(allowedOriginsProperty.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .distinct()
            .collect(Collectors.toCollection(ArrayList::new));
        
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
            .authorizeHttpRequests(auth -> {
                auth
                    .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/login/**", "/api/v1/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/request-code", "/api/v1/auth/verify-code").permitAll()
                    .requestMatchers("/api/v1/password-reset/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/produtos/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/categoria/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/banners/**").permitAll()
                    .requestMatchers("/api/v1/external/**").permitAll()
                    .requestMatchers("/api/v1/entregas/**").permitAll()
                    .requestMatchers("/api/v1/uber/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/uber/quotes/test").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/fretes/estimar").permitAll()
                    .requestMatchers("/api/v1/webhooks/**").permitAll()
                    .requestMatchers("/api/v1/pagamentos/webhooks/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/pagamentos/pedido/*/pix").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/pagamentos/pedido/*/pix/obter-ou-recriar").permitAll()
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                    .requestMatchers("/api/v1/lojistas/me").authenticated()
                    .requestMatchers("/api/v1/lojistas/*/estatisticas").authenticated()
                    .requestMatchers("/api/v1/lojistas/*/dados-bancarios/**").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/v1/lojistas/**").permitAll()
                    .requestMatchers("/api/v1/auth/promote-to-admin").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                    .requestMatchers("/actuator/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN");

                if (devToolsEnabled) {
                    auth.requestMatchers("/api/v1/dev/**").permitAll();
                } else {
                    auth.requestMatchers("/api/v1/dev/**").denyAll();
                }

                if (apiDocsEnabled) {
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll();
                } else {
                    auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").denyAll();
                }

                auth.anyRequest().authenticated();
            })
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
