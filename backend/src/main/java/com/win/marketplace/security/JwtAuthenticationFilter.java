package com.win.marketplace.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro JWT que intercepta requisições e valida o token de autenticação
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        // Log para debug
        log.info("Request URL: {} | Authorization Header: {}", request.getRequestURI(), 
                 authHeader != null ? "Bearer ***" : "NULL");
        
        // Se não houver header Authorization ou não começar com "Bearer ", pula o filtro
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Sem token JWT para: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extrai o token do header
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractEmail(jwt);

            // Se o email foi extraído e o usuário ainda não está autenticado
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Valida o token
                if (jwtService.validateToken(jwt, userEmail)) {
                    // Extrai os perfis do token
                    List<String> perfis = jwtService.extractPerfis(jwt);
                    
                    log.info("Token válido para usuário: {} | Perfis: {}", userEmail, perfis);
                    
                    // Converte perfis em authorities do Spring Security (usando toList() para lista imutável)
                    List<SimpleGrantedAuthority> authorities = perfis.stream()
                            .map(perfil -> new SimpleGrantedAuthority("ROLE_" + perfil))
                            .toList();
                    
                    log.info("Authorities criadas: {}", authorities);

                    // Criar UserDetails simples para injeção com @AuthenticationPrincipal
                    org.springframework.security.core.userdetails.User userDetailsObj = 
                        new org.springframework.security.core.userdetails.User(
                            userEmail,
                            "", // senha não é necessária aqui
                            authorities
                        );

                    // Cria o objeto de autenticação com UserDetails como principal
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetailsObj, // MUDANÇA: UserDetails ao invés de String
                            null,
                            authorities
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Define a autenticação no contexto de segurança
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    log.info("Autenticação configurada com sucesso para: {}", userEmail);
                } else {
                    log.warn("Token inválido ou expirado para: {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao processar token JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
