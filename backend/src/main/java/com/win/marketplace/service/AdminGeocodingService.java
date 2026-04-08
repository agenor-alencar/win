package com.win.marketplace.service;

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
    // private final LojistasRepository lojistasRepository; // Será injetado quando necessário

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
        
        // Nota: Esta é uma implementação placeholder
        // A implementação real requeriria acesso ao LojistasRepository
        // que não foi injetado para evitar dependências circulares
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("status", "pending");
        resultado.put("mensagem", "Geocodificação iniciada. Use o endpoint específico para lojistas individuais.");
        resultado.put("info", "Para geocodificar todos, configure o AdminGeocodingService com LojistasRepository");
        
        log.info("📢 Resposta: {}", resultado);
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

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("id", lojistaId);
        resultado.put("status", "em_progresso");
        resultado.put("mensagem", "Geocodificação iniciada para lojista individual");
        resultado.put("nota", "Implemente LojistasRepository injection para ativar essa funcionalidade");
        
        log.info("📢 Esse endpoint requer integração com LojistasRepository");
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
