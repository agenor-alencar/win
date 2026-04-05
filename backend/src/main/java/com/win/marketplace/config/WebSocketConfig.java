package com.win.marketplace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuração WebSocket com STOMP
 * 
 * Responsabilidades:
 * - Habilitar mensageria WebSocket
 * - Configurar message broker (in-memory)
 * - Definir endpoints de conexão
 * - Configurar prefixos de destino
 * 
 * Endpoints:
 * - /ws/connect - Cliente WebSocket se conecta
 * - /topic/entrega/{deliveryId} - Escuta atualizações de entrega
 * - /topic/entrega/{deliveryId}/status - Escuta mudanças de status
 * - /topic/entrega/{deliveryId}/courier - Escuta info do motorista
 * 
 * Exemplo de conexão no frontend:
 * const socket = new SockJS('/ws/connect');
 * const stompClient = Stomp.over(socket);
 * stompClient.connect({}, () => {
 *   stompClient.subscribe('/topic/entrega/123abc/status', (message) => {
 *     console.log('Novo status:', message.body);
 *   });
 * });
 * 
 * @author WinMarketplace Team
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173}")
    private String allowedOrigins;

    /**
     * Configura o message broker
     * - enableSimpleBroker: ativa broker in-memory para /topic
     * - setApplicationDestinationPrefixes: prefixo para mensagens client-to-server
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registra STOMP endpoints
     * - /ws/connect: URL onde cliente se conecta
     * - setAllowedOrigins: CORS restringido via configuração (FIX-001: Security Hardening)
     * - withSockJS(): fallback para browsers antigos
     * 
     * NOTA CRÍTICA DE SEGURANÇA:
     * Antes da implementação deste fix, CORS estava *aberto* (.setAllowedOrigins("*"))
     * Isso permitia ataques CSRF de qualquer origem. Agora é controlado via ambiente.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = java.util.Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toArray(String[]::new);
        
        registry.addEndpoint("/ws/connect")
                .setAllowedOrigins(origins)  // ✅ FIX-001: CORS configurável e restrito
                .withSockJS();
        
        // Endpoint WebSocket nativo (sem SockJS)
        registry.addEndpoint("/ws/connect")
                .setAllowedOrigins(origins);
    }
}
