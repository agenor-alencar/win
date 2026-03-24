package com.win.marketplace.config;

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
     * - setAllowedOrigins("*"): CORS - remover "*" em produção
     * - withSockJS(): fallback para browsers antigos
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/connect")
                .setAllowedOrigins("*")  // TODO: Configurar origem corretamente em produção
                .withSockJS();
        
        // Endpoint WebSocket nativo (sem SockJS)
        registry.addEndpoint("/ws/connect")
                .setAllowedOrigins("*");
    }
}
