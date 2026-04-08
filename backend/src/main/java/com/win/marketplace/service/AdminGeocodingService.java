package com.win.marketplace.service;

import com.win.marketplace.model.Lojista;
import com.win.marketplace.repository.LojistaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Serviço de Geocodificação Administrativa
 * 
 * Responsável por:
 * - Geocodificar todos os lojistas em background
 * - Geocodificar lojista individual
 * - Atualizar banco de dados com coordenadas
 * - Registrar relatório de execução
 * 
 * ⚠️ IMPORTANTE: Este service é uma FACHADA que coordena:
 *    - GeocodingService (API de geocodificação)
 *    - LojistasRepository (acesso ao banco)
 * 
 * @author WinMarketplace Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminGeocodingService {

    // ================== DEPENDÊNCIAS ==================
    private final GeocodingService geocodingService;
    private final LojistaRepository lojistasRepository;

    // ================== CONFIGURAÇÕES ==================
    private static final int DELAY_ENTRE_REQUESTS_MS = 600;  // Rate limiting: 600ms entre requisições
    private static final int MAX_BATCH_SIZE = 100;  // Processar lojistas em batches

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
        log.info("🚀 [START] Geocodificação em massa de todos os lojistas");
        
        List<Lojista> lojistas = lojistasRepository.findAll();
        int success = 0;
        int failed = 0;
        int skipped = 0;
        List<String> erros = new ArrayList<>();

        for (Lojista lojista : lojistas) {
            try {
                // Verificar se já tem coordenadas
                if (lojista.getLatitude() != null && lojista.getLongitude() != null) {
                    skipped++;
                    log.debug("⏭️  Pulando lojista {} - já geocodificado", lojista.getId());
                    continue;
                }

                // Construir endereço completo
                String endereco = construirEnderecoCompleto(
                        lojista.getLogradouro(),
                        lojista.getNumero(),
                        lojista.getBairro(),
                        lojista.getCidade(),
                        lojista.getUf(),
                        lojista.getCep()
                );

                if (endereco.isEmpty()) {
                    failed++;
                    String erro = String.format("❌ Dados insuficientes para %s", lojista.getNomeFantasia());
                    erros.add(erro);
                    log.warn(erro);
                    continue;
                }

                // Geocodificar
                Double[] coords = geocodingService.geocodificar(lojista.getCep(), endereco);

                if (coords != null && coords.length == 2) {
                    lojista.setLatitude(coords[0]);
                    lojista.setLongitude(coords[1]);
                    lojistasRepository.save(lojista);
                    success++;
                    log.info("✅ Geocodificado: {} ({}, {})",
                            lojista.getNomeFantasia(), coords[0], coords[1]);
                } else {
                    failed++;
                    String erro = String.format("❌ Falha ao geocodificar: %s", lojista.getNomeFantasia());
                    erros.add(erro);
                    log.warn(erro);
                }

                // Respeitar limite de API (100 req/min = 1 req/s = 1000ms)
                // Usando 600ms para ser mais conservador
                Thread.sleep(DELAY_ENTRE_REQUESTS_MS);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                failed++;
                log.error("❌ Thread interrompida ao processar lojista {}", lojista.getId(), e);
                erros.add("Thread interrompida: " + e.getMessage());
            } catch (Exception e) {
                failed++;
                log.error("❌ Erro processando lojista {}: {}", lojista.getId(), e.getMessage(), e);
                erros.add(String.format("Erro em %s: %s", lojista.getNomeFantasia(), e.getMessage()));
            }
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_lojistas", lojistas.size());
        resultado.put("geocodificados", success);
        resultado.put("falhados", failed);
        resultado.put("saltados", skipped);
        resultado.put("mensagem", String.format(
                "✅ Geocodificação concluída: %d sucesso, %d falha, %d saltados",
                success, failed, skipped));
        
        if (!erros.isEmpty()) {
            resultado.put("erros", erros);
        }

        log.info("🏁 Geocodificação em massa finalizada - Success: {}, Failed: {}, Skipped: {}", 
                success, failed, skipped);
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
        log.info("🔍 [START] Geocodificação individual - Lojista ID: {}", lojistaId);
        
        // Validação de entrada
        if (lojistaId == null || lojistaId.trim().isEmpty()) {
            log.warn("⚠️ ID de lojista vazio");
            throw new IllegalArgumentException("ID de lojista não pode ser vazio");
        }

        // Validar formato UUID
        if (!isValidUUID(lojistaId)) {
            log.warn("⚠️ ID de lojista em formato inválido: {}", lojistaId);
            throw new IllegalArgumentException("ID de lojista inválido (não é um UUID)");
        }

        // Buscar lojista no banco
        Lojista lojista = lojistasRepository.findById(UUID.fromString(lojistaId))
                .orElseThrow(() -> {
                    log.error("❌ Lojista não encontrado: {}", lojistaId);
                    return new RuntimeException("Lojista não encontrado: " + lojistaId);
                });

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", lojista.getId().toString());
        resultado.put("nome", lojista.getNomeFantasia());

        // Verificar se já tem coordenadas
        if (lojista.getLatitude() != null && lojista.getLongitude() != null) {
            resultado.put("latitude", lojista.getLatitude());
            resultado.put("longitude", lojista.getLongitude());
            resultado.put("status", "já_geocodificado");
            resultado.put("mensagem", "✅ Lojista já possui coordenadas geocodificadas");
            log.info("⏭️  Lojista {} já geocodificado: ({}, {})", 
                    lojista.getNomeFantasia(), lojista.getLatitude(), lojista.getLongitude());
            return resultado;
        }

        // Construir endereço completo
        String endereco = construirEnderecoCompleto(
                lojista.getLogradouro(),
                lojista.getNumero(),
                lojista.getBairro(),
                lojista.getCidade(),
                lojista.getUf(),
                lojista.getCep()
        );

        if (endereco.isEmpty()) {
            resultado.put("latitude", "error");
            resultado.put("longitude", "error");
            resultado.put("status", "erro");
            resultado.put("mensagem", "❌ Dados de endereço insuficientes para geocodificação");
            log.warn("❌ Dados insuficientes para lojista {}", lojistaId);
            return resultado;
        }

        try {
            // Geocodificar
            Double[] coords = geocodingService.geocodificar(lojista.getCep(), endereco);

            if (coords != null && coords.length == 2) {
                lojista.setLatitude(coords[0]);
                lojista.setLongitude(coords[1]);
                lojistasRepository.save(lojista);

                resultado.put("latitude", coords[0]);
                resultado.put("longitude", coords[1]);
                resultado.put("status", "sucesso");
                resultado.put("mensagem", "✅ Geocodificação bem-sucedida");
                log.info("✅ Geocodificado com sucesso: {} ({}, {})", 
                        lojista.getNomeFantasia(), coords[0], coords[1]);
            } else {
                resultado.put("latitude", "error");
                resultado.put("longitude", "error");
                resultado.put("status", "erro");
                resultado.put("mensagem", "❌ Falha ao geocodificar endereço - API retornou vazio");
                log.warn("❌ Falha ao geocodificar: {}", lojista.getNomeFantasia());
            }
        } catch (Exception e) {
            resultado.put("latitude", "error");
            resultado.put("longitude", "error");
            resultado.put("status", "erro");
            resultado.put("mensagem", "❌ Erro ao geocodificar: " + e.getMessage());
            log.error("❌ Erro ao geocodificar lojista {}: {}", lojistaId, e.getMessage(), e);
        }

        return resultado;
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
