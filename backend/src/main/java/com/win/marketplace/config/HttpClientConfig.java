package com.win.marketplace.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuração de beans HTTP para comunicação externa.
 * 
 * Timeouts configurados:
 * - Connection Timeout: 5s (tempo para estabelecer conexão) 
 * - Read Timeout: 10s (tempo para ler resposta)
 * 
 * Isso evita que requisições externas (Uber API, ViaCEP, Nominatim) 
 * fiquem travadas indefinidamente.
 */
@Configuration
public class HttpClientConfig {

    /**
     * Bean RestTemplate para chamadas HTTP síncronas.
     * Usado pela integração com Uber Flash API, ViaCEP, Nominatim, etc.
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }
}
