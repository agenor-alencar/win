package com.win.marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
public class WinMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(WinMarketApplication.class, args);
    }

}