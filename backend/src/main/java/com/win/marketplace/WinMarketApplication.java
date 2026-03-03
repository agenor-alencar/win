package com.win.marketplace;

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

    public static void main(String[] args) {
        SpringApplication.run(WinMarketApplication.class, args);
    }

}