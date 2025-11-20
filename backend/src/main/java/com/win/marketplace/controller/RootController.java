package com.win.marketplace.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping; // <-- Nova importação

@Controller
@RequestMapping("/") // <-- NOVA ANOTAÇÃO: Mapeia o controller para o caminho raiz
public class RootController {

    /**
     * Redireciona o acesso à URL raiz (http://seu-ip/) 
     * para o endpoint que exibe o menu de produtos.
     */
    @GetMapping
    // NOTA: Removemos o caminho do GetMapping, pois ele já está no @RequestMapping
    public String redirectToProducts() {
        // Redirecionamento 302 (Temporário)
        return "redirect:/api/v1/produtos";
    }
}