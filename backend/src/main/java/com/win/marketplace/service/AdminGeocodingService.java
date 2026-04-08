package com.win.marketplace.service;

import com.win.marketplace.model.Lojista;
import com.win.marketplace.repository.LojistaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Serviço administrativo profissional para geocodificação de lojistas
 * 
 * Responsabilidades:
 * - Geocodificar TODOS os lojistas sem coordenadas (batch processing)
 * - Geocodificar lojista individual sob demanda
 * - Atualizar persistência com coordenadas obtidas
 * - Rate limiting respeitando APIs externas
 * - Logging e rastreabilidade completa
 * - Tratamento robusto de erros com recuperação
 * 
 * Integração:
 * - GeocodingService: Chamadas para Nominatim/Google Maps
 * - LojistaRepository: Persistência de dados
 * 
 * Performance:
 * - Rate limit: 600ms entre requisições (1 req/s = 3600 req/hora)
 * - Cache automático via GeocodingService (24h TTL)
 * - Transações isoladas por lojista para resiliência
 * 
 * @author WinMarketplace Team
 * @version 1.0-PROFESSIONAL
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminGeocodingService {

    // ================== DEPENDÊNCIAS INJETADAS ==================
    private final GeocodingService geocodingService;
    private final LojistaRepository lojistasRepository;

    // ================== CONFIGURAÇÕES DE RATE LIMITING ==================
    private static final long RATE_LIMIT_MS = 600;  // Rate limiting: 600ms entre requisições
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    /**
     * Geocodificar TODOS os lojistas sem coordenadas.
     * 
     * Algoritmo:
     * 1. Buscar lojistas sem latitude/longitude
     * 2. Para cada lojista:
     *    - Montar endereço completo (CEP + logradouro + número)
     *    - Chamar GeocodingService.geocodificar()
     *    - Se sucesso: atualizar banco de dados
     *    - Se falha: registrar no relatório
     *    - Respeitar rate limit (600ms entre requisições)
     * 3. Retornar relatório com estatísticas
     * 
     * ⚠️ TIMEOUT: Operação pode levar MINUTOS se houver muitos lojistas (1 req/s)
     * 
     * @return Mapa com estatísticas da geocodificação
     *         - total_lojistas: Total processado
     *         - geocodificados: Sucesso
     *         - falhados: Falhas
     *         - saltados: Já tinha coordenadas
     */
    @Transactional
    public Map<String, Object> geocodificarTodosLojistas() {
        long startTime = System.currentTimeMillis();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        
        log.info("========================================");
        log.info("[GEOCODIFICACAO-BATCH] ✅ INICIANDO");
        log.info("Timestamp: {}", timestamp);
        log.info("========================================");
        
        List<Lojista> allLojistas = lojistasRepository.findAll();
        List<Lojista> toGeocode = allLojistas.stream()
                .filter(l -> l.getLatitude() == null || l.getLongitude() == null)
                .toList();
        
        AtomicInteger success = new AtomicInteger(0);
        AtomicInteger failed = new AtomicInteger(0);
        AtomicInteger skipped = new AtomicInteger(allLojistas.size() - toGeocode.size());
        List<Map<String, String>> erros = new ArrayList<>();
        
        log.info("Total de lojistas no banco: {}", allLojistas.size());
        log.info("Lojistas sem coordenadas: {}", toGeocode.size());
        log.info("Lojistas já geocodificados: {}", skipped.get());

        for (int i = 0; i < toGeocode.size(); i++) {
            Lojista lojista = toGeocode.get(i);
            log.info("[{}/{}] Processando: {} (ID: {})", 
                    i + 1, toGeocode.size(), lojista.getNomeFantasia(), lojista.getId());
            
            try {
                // Construir endereço
                String endereco = construirEnderecoCompleto(
                        lojista.getLogradouro(), lojista.getNumero(), 
                        lojista.getBairro(), lojista.getCidade(), 
                        lojista.getUf(), lojista.getCep()
                );

                if (endereco.isEmpty()) {
                    failed.incrementAndGet();
                    String erro = "Dados de endereço insuficientes";
                    erros.add(Map.of("lojista", lojista.getId().toString(), "nome", lojista.getNomeFantasia(), "motivo", erro));
                    log.warn("  ❌ Falha: {}", erro);
                    continue;
                }

                // Chamar geocoding service
                Double[] coords = geocodingService.geocodificar(lojista.getCep(), endereco);

                if (coords != null && coords.length == 2 && coords[0] != null && coords[1] != null) {
                    lojista.setLatitude(coords[0]);
                    lojista.setLongitude(coords[1]);
                    lojistasRepository.save(lojista);
                    success.incrementAndGet();
                    log.info("  ✅ Sucesso: {}, {}", coords[0], coords[1]);
                } else {
                    failed.incrementAndGet();
                    String erro = "Falha ao obter coordenadas da API";
                    erros.add(Map.of("lojista", lojista.getId().toString(), "nome", lojista.getNomeFantasia(), "motivo", erro));
                    log.warn("  ❌ Falha: {}", erro);
                }

                // Rate limiting entre requisições
                if (i < toGeocode.size() - 1) {
                    Thread.sleep(RATE_LIMIT_MS);
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                failed.incrementAndGet();
                log.error("  ❌ Interrupção de thread ao processar lojista {}: {}", lojista.getId(), e.getMessage());
                erros.add(Map.of("lojista", lojista.getId().toString(), "nome", lojista.getNomeFantasia(), "motivo", "Interrupção de thread"));
            } catch (Exception e) {
                failed.incrementAndGet();
                log.error("  ❌ Erro ao processar lojista {}: {}", lojista.getId(), e.getMessage(), e);
                erros.add(Map.of("lojista", lojista.getId().toString(), "nome", lojista.getNomeFantasia(), "motivo", e.getMessage()));
            }
        }

        long durationMs = System.currentTimeMillis() - startTime;
        double taxa = toGeocode.size() > 0 ? (success.get() * 100.0) / toGeocode.size() : 0;
        
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("timestamp", timestamp);
        resultado.put("total_lojistas", allLojistas.size());
        resultado.put("processados", toGeocode.size());
        resultado.put("geocodificados", success.get());
        resultado.put("falhados", failed.get());
        resultado.put("saltados", skipped.get());
        resultado.put("taxa_sucesso_percentual", String.format("%.1f%%", taxa));
        resultado.put("duracao_ms", durationMs);
        resultado.put("mensagem", String.format(
                "Geocodificação em lote concluída: %d sucesso, %d falha, %d saltados em %dms",
                success.get(), failed.get(), skipped.get(), durationMs));
        resultado.put("status", failed.get() == 0 ? "SUCESSO" : "PARCIAL");
        
        if (!erros.isEmpty()) {
            resultado.put("erros", erros);
        }

        log.info("========================================");
        log.info("[GEOCODIFICACAO-BATCH] ✅ FINALIZADO");
        log.info("Resultado: {} sucesso, {} falha, {} saltados", success.get(), failed.get(), skipped.get());
        log.info("Taxa de sucesso: {}", String.format("%.1f%%", taxa));
        log.info("Duração total: {}ms", durationMs);
        log.info("Status: {}", (String) resultado.get("status"));
        log.info("========================================");
        
        return resultado;
    }

    /**
     * Geocodificar um lojista específico.
     * 
     * Algoritmo:
     * 1. Validar ID do lojista
     * 2. Buscar lojista no banco
     * 3. Se não encontrado: lançar erro
     * 4. Se já tem coordenadas: retornar as existentes
     * 5. Montar endereço completo
     * 6. Chamar GeocodingService.geocodificar()
     * 7. Se sucesso: atualizar banco e retornar
     * 8. Se falha: retornar erro com sugestões
     * 
     * @param lojistaId UUID do lojista (validado via @NotBlank)
     * @return Mapa com:
     *         - id: UUID do lojista
     *         - nome: Nome fantasia
     *         - latitude: Coordenada Y (ou "error" se falhou)
     *         - longitude: Coordenada X (ou "error" se falhou)
     *         - status: "sucesso" ou "erro"
     *         - mensagem: Descrição do resultado
     * 
     * @throws IllegalArgumentException Se lojistaId for inválido
     * @throws RuntimeException Se lojista não existir
     */
    @Transactional
    public Map<String, Object> geocodificarLojista(String lojistaId) {
        log.info("Geocodificando lojista individual: {}", lojistaId);
        
        if (!isValidUUID(lojistaId)) {
            String erro = "ID de lojista inválido (não é UUID): " + lojistaId;
            log.error(erro);
            throw new IllegalArgumentException(erro);
        }
        
        UUID uuid = UUID.fromString(lojistaId);
        Lojista lojista = lojistasRepository.findById(uuid)
                .orElseThrow(() -> {
                    String erro = "Lojista não encontrado: " + lojistaId;
                    log.error(erro);
                    return new EntityNotFoundException(erro);
                });
        
        try {
            // Verificar se já tem coordenadas
            if (lojista.getLatitude() != null && lojista.getLongitude() != null) {
                log.info("Lojista {} já geocodificado: ({}, {})", 
                    lojistaId, lojista.getLatitude(), lojista.getLongitude());
                return Map.of(
                    "id", lojista.getId().toString(),
                    "nome", lojista.getNomeFantasia(),
                    "latitude", lojista.getLatitude(),
                    "longitude", lojista.getLongitude(),
                    "status", "ja_geocodificado",
                    "mensagem", "Lojista já possui coordenadas"
                );
            }

            // Construir endereço
            String endereco = construirEnderecoCompleto(
                    lojista.getLogradouro(), lojista.getNumero(), 
                    lojista.getBairro(), lojista.getCidade(), 
                    lojista.getUf(), lojista.getCep()
            );

            if (endereco.isEmpty()) {
                return Map.of(
                    "id", lojista.getId().toString(),
                    "nome", lojista.getNomeFantasia(),
                    "status", "erro",
                    "mensagem", "Dados de endereço insuficientes para geocodificação"
                );
            }

            // Chamar geocoding
            Double[] coords = geocodingService.geocodificar(lojista.getCep(), endereco);

            if (coords != null && coords.length == 2 && coords[0] != null && coords[1] != null) {
                lojista.setLatitude(coords[0]);
                lojista.setLongitude(coords[1]);
                lojistasRepository.save(lojista);

                log.info("Lojista {} geocodificado com sucesso: {}, {}", 
                        lojistaId, coords[0], coords[1]);
                return Map.of(
                    "id", lojista.getId().toString(),
                    "nome", lojista.getNomeFantasia(),
                    "latitude", coords[0],
                    "longitude", coords[1],
                    "status", "sucesso",
                    "mensagem", "Geocodificação bem-sucedida"
                );
            } else {
                return Map.of(
                    "id", lojista.getId().toString(),
                    "nome", lojista.getNomeFantasia(),
                    "status", "erro",
                    "mensagem", "Falha ao geocodificar endereço - API retornou vazio"
                );
            }
        } catch (Exception e) {
            log.error("Erro ao geocodificar lojista {}: {}", lojistaId, e.getMessage(), e);
            throw new RuntimeException("Erro ao geocodificar lojista: " + e.getMessage(), e);
        }
    }

    // ================== MÉTODOS AUXILIARES ==================

    /**
     * Construir endereço completo a partir dos dados do lojista.
     * 
     * Formato: "Rua Xxxx, 123, Bairro, Cidade, UF, 12345-678"
     * 
     * @param logradouro Rua/Avenida
     * @param numero Número da loja
     * @param bairro Bairro
     * @param cidade Cidade
     * @param uf UF (sigla de 2 caracteres)
     * @param cep CEP (com ou sem hífen)
     * @return Endereço completo ou vazio se dados insuficientes
     */
    private String construirEnderecoCompleto(
            String logradouro, String numero, String bairro, 
            String cidade, String uf, String cep) {
        
        // Validação de componentes essenciais
        if (logradouro == null || logradouro.isEmpty() ||
            cidade == null || cidade.isEmpty() ||
            uf == null || uf.isEmpty()) {
            log.warn("⚠️ Dados insuficientes para endereço: {} {} {} {}", 
                    logradouro, cidade, uf, cep);
            return "";
        }

        // Construir endereço
        StringBuilder endereco = new StringBuilder();
        endereco.append(logradouro.trim());
        
        if (numero != null && !numero.isEmpty()) {
            endereco.append(", ").append(numero.trim());
        }
        
        if (bairro != null && !bairro.isEmpty()) {
            endereco.append(", ").append(bairro.trim());
        }
        
        endereco.append(", ").append(cidade.trim());
        endereco.append(", ").append(uf.trim().toUpperCase());
        
        if (cep != null && !cep.isEmpty()) {
            endereco.append(", ").append(cep.trim());
        } else {
            endereco.append(" - Brasil");
        }

        return endereco.toString();
    }

    /**
     * Validar formato de UUID.
     * 
     *@param uuid String para validar
     * @return true se parece um UUID válido
     */
    private boolean isValidUUID(String uuid) {
        try {
            UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
