package com.win.marketplace.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;

/**
 * Controller para integração com APIs externas
 * Serve como proxy para evitar problemas de CORS no frontend
 */
@RestController
@RequestMapping("/api/v1/external")
@Slf4j
public class ExternalApiController {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Busca dados de CNPJ na ReceitaWS
     * 
     * @param cnpj CNPJ sem formatação (apenas números)
     * @return Dados da empresa
     */
    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<?> buscarCNPJ(@PathVariable String cnpj) {
        log.info("Buscando dados do CNPJ: {}", cnpj);
        
        try {
            // Remove formatação do CNPJ
            String cnpjLimpo = cnpj.replaceAll("[^0-9]", "");
            
            if (cnpjLimpo.length() != 14) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "CNPJ deve conter 14 dígitos"));
            }
            
            // Busca na ReceitaWS
            String url = "https://receitaws.com.br/v1/cnpj/" + cnpjLimpo;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            log.info("Dados do CNPJ {} encontrados com sucesso", cnpjLimpo);
            return ResponseEntity.ok(response);
            
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("CNPJ {} não encontrado na ReceitaWS", cnpj);
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("Erro ao buscar CNPJ {}: {}", cnpj, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erro ao consultar CNPJ: " + e.getMessage()));
        }
    }

    /**
     * Busca dados de CEP no ViaCEP
     * 
     * @param cep CEP sem formatação (apenas números)
     * @return Dados do endereço
     */
    @GetMapping("/cep/{cep}")
    public ResponseEntity<?> buscarCEP(@PathVariable String cep) {
        log.info("Buscando dados do CEP: {}", cep);
        
        try {
            // Remove formatação do CEP
            String cepLimpo = cep.replaceAll("[^0-9]", "");
            
            if (cepLimpo.length() != 8) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "CEP deve conter 8 dígitos"));
            }
            
            // Busca no ViaCEP
            String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            // ViaCEP retorna "erro": true quando CEP não existe
            if (response != null && Boolean.TRUE.equals(response.get("erro"))) {
                log.warn("CEP {} não encontrado no ViaCEP", cepLimpo);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Dados do CEP {} encontrados com sucesso", cepLimpo);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Erro ao buscar CEP {}: {}", cep, e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erro ao consultar CEP: " + e.getMessage()));
        }
    }
}
