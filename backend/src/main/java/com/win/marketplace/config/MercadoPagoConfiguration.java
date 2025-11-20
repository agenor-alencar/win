package com.win.marketplace.config;

import com.mercadopago.MercadoPagoConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * Configuração do Mercado Pago
 * 
 * Inicializa o SDK do Mercado Pago com o Access Token configurado no .env
 * 
 * @see <a href="https://www.mercadopago.com.br/developers/pt/docs">Documentação Mercado Pago</a>
 */
@Configuration
public class MercadoPagoConfiguration {

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @PostConstruct
    public void init() {
        if (accessToken != null && !accessToken.isBlank()) {
            MercadoPagoConfig.setAccessToken(accessToken);
            System.out.println("✅ Mercado Pago configurado com sucesso!");
        } else {
            System.out.println("⚠️  Mercado Pago não configurado (access-token ausente)");
        }
    }
}
