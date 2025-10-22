package com.win.marketplace.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class GatewayPagamentoService {

    /**
     *
     *
     * @param valor 
     * @param tokenCartao 
     * @return 
     */
    public String criarCobranca(BigDecimal valor, String tokenCartao) {
        System.out.println(String.format(
            "Simulando cobrança de R$ %.2f no gateway com o token '%s'",
            valor,
            tokenCartao
        ));

        if (valor.compareTo(BigDecimal.valueOf(1.00)) < 0) {
            throw new RuntimeException("Gateway recusou: valor muito baixo.");
        }

        return "txn_" + UUID.randomUUID().toString();
    }
}