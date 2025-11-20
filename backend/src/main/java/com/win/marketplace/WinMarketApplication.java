package com.win.marketplace;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class
})
@EnableScheduling  // Habilita tarefas agendadas (@Scheduled)
@ComponentScan(basePackages = {"com.win.marketplace", "com.win.marketplace.controller"})
public class WinMarketApplication {

    @Value("${mercadopago.access-token:}")
    private String mercadoPagoAccessToken;

    public static void main(String[] args) {
        SpringApplication.run(WinMarketApplication.class, args);
    }

    @PostConstruct
    public void initializeMercadoPago() {
        if (mercadoPagoAccessToken != null && !mercadoPagoAccessToken.isBlank()) {
            // Inicializar SDK do Mercado Pago com Access Token
            MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
            System.out.println("✅ Mercado Pago SDK inicializado com sucesso!");
        } else {
            System.out.println("⚠️  ATENÇÃO: MERCADOPAGO_ACCESS_TOKEN não configurado!");
            System.out.println("   Configure a variável de ambiente para habilitar pagamentos.");
            System.out.println("   Obtenha seu token em: https://www.mercadopago.com.br/developers/panel/app");
        }
    }

}