package com.win.marketplace;

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

    @Value("${abacatepay.api-key:}")
    private String abacatePayApiKey;

    public static void main(String[] args) {
        SpringApplication.run(WinMarketApplication.class, args);
    }

    @PostConstruct
    public void initializeAbacatePay() {
        if (abacatePayApiKey != null && !abacatePayApiKey.isBlank()) {
            System.out.println("✅ Abacate Pay configurado com sucesso!");
            System.out.println("   Gateway de pagamento: Abacate Pay");
        } else {
            System.out.println("⚠️  ATENÇÃO: ABACATEPAY_API_KEY não configurado!");
            System.out.println("   Configure a variável de ambiente para habilitar pagamentos.");
            System.out.println("   Obtenha sua chave em: https://abacatepay.com");
        }
    }

}