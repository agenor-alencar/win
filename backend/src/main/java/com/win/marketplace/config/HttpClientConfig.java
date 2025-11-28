package com.win.marketplace.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuração de beans HTTP para comunicação externa.
 */
@Configuration
public class HttpClientConfig {

    /**
     * Bean RestTemplate para chamadas HTTP síncronas.
     * Usado pela integração com Uber Flash API.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
