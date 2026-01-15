package com.win.marketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Serviço de Geocodificação para converter endereços em coordenadas (lat/long).
 * 
 * Utiliza:
 * - ViaCEP para obter dados completos do endereço a partir do CEP
 * - Nominatim (OpenStreetMap) para geocodificação gratuita
 * 
 * IMPORTANTE: Não requer chave de API (100% gratuito)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String VIACEP_URL = "https://viacep.com.br/ws/%s/json/";
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?format=json&q=%s";

    /**
     * Converte CEP + endereço completo em coordenadas geográficas.
     * 
     * @param cep CEP do endereço (com ou sem hífen)
     * @param enderecoCompleto Endereço completo (Rua + Número + Bairro + Cidade)
     * @return Array [latitude, longitude] ou null se falhar
     */
    public Double[] geocodificar(String cep, String enderecoCompleto) {
        try {
            log.info("Iniciando geocodificação - CEP: {}, Endereço: {}", cep, enderecoCompleto);

            // 1. Enriquecer endereço com dados do ViaCEP
            String enderecoEnriquecido = enriquecerEnderecoComViaCEP(cep, enderecoCompleto);
            
            // 2. Geocodificar com Nominatim (OpenStreetMap)
            Double[] coordenadas = geocodificarComNominatim(enderecoEnriquecido);
            
            if (coordenadas != null) {
                log.info("Geocodificação bem-sucedida - Lat: {}, Long: {}", 
                        coordenadas[0], coordenadas[1]);
                return coordenadas;
            } else {
                log.warn("Falha na geocodificação para CEP: {} e Endereço: {}", 
                        cep, enderecoCompleto);
                return null;
            }

        } catch (Exception e) {
            log.error("Erro ao geocodificar CEP: {} e Endereço: {} - {}", 
                    cep, enderecoCompleto, e.getMessage());
            return null;
        }
    }

    /**
     * Enriquece endereço com dados do ViaCEP (cidade, estado, bairro).
     */
    private String enriquecerEnderecoComViaCEP(String cep, String enderecoCompleto) {
        try {
            String cepLimpo = cep.replaceAll("[^0-9]", "");
            String url = String.format(VIACEP_URL, cepLimpo);
            
            log.debug("Consultando ViaCEP: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WinMarketplace/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode viaCepData = objectMapper.readTree(response.getBody());
                
                // Verificar se CEP é válido (não retorna erro)
                if (!viaCepData.has("erro")) {
                    String logradouro = viaCepData.path("logradouro").asText("");
                    String bairro = viaCepData.path("bairro").asText("");
                    String cidade = viaCepData.path("localidade").asText("");
                    String estado = viaCepData.path("uf").asText("");
                    
                    // Montar endereço completo enriquecido
                    String enderecoEnriquecido = String.format("%s, %s, %s, %s, Brasil", 
                            enderecoCompleto, bairro, cidade, estado);
                    
                    log.debug("Endereço enriquecido: {}", enderecoEnriquecido);
                    return enderecoEnriquecido;
                }
            }
        } catch (Exception e) {
            log.warn("Erro ao enriquecer endereço com ViaCEP: {}", e.getMessage());
        }
        
        // Retornar endereço original se ViaCEP falhar
        return enderecoCompleto + ", Brasil";
    }

    /**
     * Geocodifica usando Nominatim (OpenStreetMap).
     */
    private Double[] geocodificarComNominatim(String endereco) {
        try {
            String enderecoEncoded = URLEncoder.encode(endereco, StandardCharsets.UTF_8);
            String url = String.format(NOMINATIM_URL, enderecoEncoded);
            
            log.debug("Consultando Nominatim: {}", url);
            
            // Nominatim exige User-Agent (política de uso)
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WinMarketplace/1.0 (contato@winmarketplace.com.br)");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode resultados = objectMapper.readTree(response.getBody());
                
                // Nominatim retorna array de resultados
                if (resultados.isArray() && resultados.size() > 0) {
                    JsonNode primeiro = resultados.get(0);
                    Double latitude = primeiro.path("lat").asDouble();
                    Double longitude = primeiro.path("lon").asDouble();
                    
                    log.debug("Nominatim retornou: lat={}, lon={}", latitude, longitude);
                    return new Double[]{latitude, longitude};
                }
            }
        } catch (Exception e) {
            log.error("Erro ao geocodificar com Nominatim: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * Converte apenas CEP em coordenadas (sem número/complemento).
     * Útil para endereços de origem (lojistas).
     */
    public Double[] geocodificarPorCEP(String cep) {
        try {
            String cepLimpo = cep.replaceAll("[^0-9]", "");
            String url = String.format(VIACEP_URL, cepLimpo);
            
            log.debug("Geocodificando por CEP: {}", cep);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "WinMarketplace/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode viaCepData = objectMapper.readTree(response.getBody());
                
                if (!viaCepData.has("erro")) {
                    String logradouro = viaCepData.path("logradouro").asText("");
                    String bairro = viaCepData.path("bairro").asText("");
                    String cidade = viaCepData.path("localidade").asText("");
                    String estado = viaCepData.path("uf").asText("");
                    
                    // Geocodificar usando cidade/estado como fallback
                    String endereco = String.format("%s, %s, %s, Brasil", 
                            bairro, cidade, estado);
                    
                    return geocodificarComNominatim(endereco);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao geocodificar por CEP: {}", e.getMessage());
        }
        
        return null;
    }
}
