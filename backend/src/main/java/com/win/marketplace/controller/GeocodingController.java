package com.win.marketplace.controller;

import com.win.marketplace.dto.GeocodingRequestDTO;
import com.win.marketplace.dto.GeocodingResponseDTO;
import com.win.marketplace.service.GeocodingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para exposição de endpoints de Geocoding
 * 
 * Responsável por:
 * - Geocodificar endereços (CEP + logradouro)
 * - Calcular coordenadas para rotas de entrega (origem + destino)
 * - Suportar diferentes APIs (ViaCEP, Nominatim, Google Maps)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/geocoding")
@RequiredArgsConstructor
@Tag(name = "Geocoding", description = "APIs de Geocodificação e Geolocalização")
public class GeocodingController {

    private final GeocodingService geocodingService;

    /**
     * Geocodifica um CEP individual
     * 
     * @param cep CEP do endereço (8 dígitos, com ou sem hífen)
     * @return Latitude e longitude
     */
    @GetMapping("/cep/{cep}")
    @Operation(summary = "Geocodificar por CEP", description = "Converte CEP em coordenadas latitude/longitude")
    public ResponseEntity<?> geocodificarPorCEP(@PathVariable String cep) {
        log.info("🔍 GET /api/v1/geocoding/cep/{} - Geocodificando por CEP", cep);
        
        Double[] coords = geocodingService.geocodificarPorCEP(cep);
        
        if (coords == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new java.util.HashMap<String, Object>() {{
                        put("erro", "CEP não encontrado ou falha na geocodificação");
                        put("cep", cep);
                    }});
        }
        
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("cep", cep);
            put("latitude", coords[0]);
            put("longitude", coords[1]);
            put("tipo", "CEP");
        }});
    }

    /**
     * Geocodifica um endereço completo (CEP + logradouro + número)
     * 
     * @param cep CEP
     * @param endereco Logradouro + número + complemento
     * @return Latitude e longitude
     */
    @GetMapping("/endereco")
    @Operation(summary = "Geocodificar Endereço Completo", description = "Converte CEP + endereço em coordenadas")
    public ResponseEntity<?> geocodificarEndereco(
            @RequestParam(value = "cep", required = false) String cep,
            @RequestParam(value = "endereco") String endereco) {
        
        log.info("🔍 GET /api/v1/geocoding/endereco - Geocodificando: CEP={}, Endereço={}", cep, endereco);
        
        Double[] coords = geocodingService.geocodificar(cep, endereco);
        
        if (coords == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new java.util.HashMap<String, Object>() {{
                        put("erro", "Endereço não encontrado ou falha na geocodificação");
                        put("cep", cep);
                        put("endereco", endereco);
                    }});
        }
        
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("cep", cep);
            put("endereco", endereco);
            put("latitude", coords[0]);
            put("longitude", coords[1]);
            put("tipo", "ENDERECO_COMPLETO");
        }});
    }

    /**
     * Geocodifica uma rota completa (endereço de origem + destino)
     * Para uso em cálculos de frete via Uber Direct
     * 
     * @param cepOrigem CEP do lojista (origem)
     * @param enderecoOrigem Endereço do lojista (origem)
     * @param cepDestino CEP do cliente (destino)
     * @param enderecoDestino Endereço do cliente (destino)
     * @return Coordenadas de origem e destino
     */
    @GetMapping("/rota")
    @Operation(summary = "Geocodificar Rota de Entrega", 
               description = "Geocodifica origem e destino para cálculo de frete")
    public ResponseEntity<?> geocodificarRota(
            @RequestParam(value = "cep_origem", required = false) String cepOrigem,
            @RequestParam(value = "endereco_origem") String enderecoOrigem,
            @RequestParam(value = "cep_destino", required = false) String cepDestino,
            @RequestParam(value = "endereco_destino") String enderecoDestino) {
        
        log.info("🔍 Geocodificando ROTA - Origem: {}, {} | Destino: {}, {}", 
                 cepOrigem, enderecoOrigem, cepDestino, enderecoDestino);
        
        Double[] coordsOrigem = geocodingService.geocodificar(cepOrigem, enderecoOrigem);
        Double[] coordsDestino = geocodingService.geocodificar(cepDestino, enderecoDestino);
        
        if (coordsOrigem == null || coordsDestino == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new java.util.HashMap<String, Object>() {{
                        put("erro", "Falha ao geocodificar um ou ambos os endereços");
                        put("origem_geocodificada", coordsOrigem != null);
                        put("destino_geocodificada", coordsDestino != null);
                    }});
        }
        
        log.info("✅ ROTA geocodificada com sucesso");
        
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("origem", new java.util.HashMap<String, Object>() {{
                put("cep", cepOrigem);
                put("endereco", enderecoOrigem);
                put("latitude", coordsOrigem[0]);
                put("longitude", coordsOrigem[1]);
            }});
            put("destino", new java.util.HashMap<String, Object>() {{
                put("cep", cepDestino);
                put("endereco", enderecoDestino);
                put("latitude", coordsDestino[0]);
                put("longitude", coordsDestino[1]);
            }});
            put("tipo", "ROTA_ENTREGA");
        }});
    }

    /**
     * Obtém estatísticas do cache de geocodificação
     * Útil para monitoramento e debugging
     */
    @GetMapping("/cache/stats")
    @Operation(summary = "Estatísticas do Cache", description = "Retorna informações sobre o cache de geocodificação")
    public ResponseEntity<?> getEstatisticasCache() {
        log.info("📊 GET /api/v1/geocoding/cache/stats - Retornando estatísticas");
        return ResponseEntity.ok(geocodingService.getEstatisticasCache());
    }

    /**
     * Limpa cache expirado manualmente
     * Útil para operações de manutenção
     */
    @PostMapping("/cache/limpar")
    @Operation(summary = "Limpar Cache Expirado", description = "Remove entradas expiradas do cache")
    public ResponseEntity<?> limparCacheExpirado() {
        log.info("🧹 POST /api/v1/geocoding/cache/limpar - Limpando cache");
        geocodingService.limparCacheExpirado();
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("mensagem", "Cache de geocodificação limpo com sucesso");
        }});
    }
}
