package com.win.marketplace.service;

import com.win.marketplace.dto.request.DadosBancariosRequestDTO;
import com.win.marketplace.dto.response.DadosBancariosResponseDTO;
import com.win.marketplace.model.DadosBancarios;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.repository.DadosBancariosRepository;
import com.win.marketplace.repository.LojistaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DadosBancariosService {

    private final DadosBancariosRepository dadosBancariosRepository;
    private final LojistaRepository lojistaRepository;
    private final PagarMeService pagarMeService;

    /**
     * Cadastra ou atualiza dados bancários do lojista
     * E cria automaticamente o recipient no Pagar.me
     */
    public DadosBancariosResponseDTO cadastrarDadosBancarios(UUID lojistaId, DadosBancariosRequestDTO request) {
        Lojista lojista = lojistaRepository.findById(lojistaId)
            .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        // Buscar ou criar novo registro
        DadosBancarios dadosBancarios = dadosBancariosRepository.findByLojistaId(lojistaId)
            .orElse(new DadosBancarios());

        // Atualizar dados
        dadosBancarios.setLojista(lojista);
        dadosBancarios.setTitularNome(request.titularNome());
        dadosBancarios.setTitularDocumento(request.titularDocumento().replaceAll("[^0-9]", ""));
        dadosBancarios.setTitularTipo(request.titularTipo());
        dadosBancarios.setCodigoBanco(request.codigoBanco());
        dadosBancarios.setAgencia(request.agencia());
        dadosBancarios.setAgenciaDv(request.agenciaDv());
        dadosBancarios.setConta(request.conta());
        dadosBancarios.setContaDv(request.contaDv());
        dadosBancarios.setTipoConta(request.tipoConta());
        dadosBancarios.setValidado(false); // Será validado no Pagar.me

        // Salvar no banco
        DadosBancarios saved = dadosBancariosRepository.save(dadosBancarios);

        log.info("💾 Dados bancários salvos para lojista: {} - Iniciando criação de recipient...", lojistaId);

        // Tentar criar recipient no Pagar.me automaticamente
        try {
            criarRecipientAutomatico(lojista, saved);
        } catch (Exception e) {
            log.error("❌ Erro ao criar recipient automaticamente: {}", e.getMessage());
            // Não falha a operação, apenas loga o erro
            // O lojista pode tentar novamente depois
        }

        return toResponseDTO(saved, lojista);
    }

    /**
     * Cria recipient automaticamente no Pagar.me
     */
    private void criarRecipientAutomatico(Lojista lojista, DadosBancarios dadosBancarios) {
        // Verificar se já existe recipient
        if (lojista.getPagarmeRecipientId() != null && !lojista.getPagarmeRecipientId().isEmpty()) {
            log.info("ℹ️  Recipient já existe para lojista: {}", lojista.getId());
            return;
        }

        // Preparar dados para API Pagar.me
        Map<String, String> dadosBancariosMap = new HashMap<>();
        dadosBancariosMap.put("holder_name", dadosBancarios.getTitularNome());
        dadosBancariosMap.put("holder_document", dadosBancarios.getTitularDocumento());
        dadosBancariosMap.put("bank_code", dadosBancarios.getCodigoBanco());
        dadosBancariosMap.put("agencia", dadosBancarios.getAgencia());
        dadosBancariosMap.put("agencia_dv", dadosBancarios.getAgenciaDv() != null ? dadosBancarios.getAgenciaDv() : "");
        dadosBancariosMap.put("conta", dadosBancarios.getConta());
        dadosBancariosMap.put("conta_dv", dadosBancarios.getContaDv());
        dadosBancariosMap.put("type", dadosBancarios.getTipoConta());

        // Chamar API Pagar.me
        Map<String, Object> resultado = pagarMeService.criarRecipient(
            lojista.getRazaoSocial(),
            lojista.getCnpj(),
            lojista.getUsuario().getEmail(),
            dadosBancarios.getTitularTipo(),
            dadosBancariosMap
        );

        // Salvar recipient ID no lojista
        String recipientId = (String) resultado.get("id");
        lojista.setPagarmeRecipientId(recipientId);
        lojistaRepository.save(lojista);

        // Marcar como validado
        dadosBancarios.setValidado(true);
        dadosBancariosRepository.save(dadosBancarios);

        log.info("✅ Recipient criado automaticamente - ID: {} para lojista: {}", recipientId, lojista.getId());
    }

    /**
     * Busca dados bancários do lojista
     */
    @Transactional(readOnly = true)
    public DadosBancariosResponseDTO buscarDadosBancarios(UUID lojistaId) {
        Lojista lojista = lojistaRepository.findById(lojistaId)
            .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        DadosBancarios dadosBancarios = dadosBancariosRepository.findByLojistaId(lojistaId)
            .orElseThrow(() -> new RuntimeException("Dados bancários não encontrados"));

        return toResponseDTO(dadosBancarios, lojista);
    }

    /**
     * Força recriação do recipient no Pagar.me
     * Útil se houve erro na primeira tentativa
     */
    public DadosBancariosResponseDTO recriarRecipient(UUID lojistaId) {
        Lojista lojista = lojistaRepository.findById(lojistaId)
            .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        DadosBancarios dadosBancarios = dadosBancariosRepository.findByLojistaId(lojistaId)
            .orElseThrow(() -> new RuntimeException("Dados bancários não cadastrados. Cadastre primeiro."));

        log.info("🔄 Recriando recipient para lojista: {}", lojistaId);

        // Limpar recipient ID anterior
        lojista.setPagarmeRecipientId(null);
        lojistaRepository.save(lojista);

        // Criar novamente
        criarRecipientAutomatico(lojista, dadosBancarios);

        return toResponseDTO(dadosBancarios, lojista);
    }

    /**
     * Converte entidade para DTO de resposta (com dados mascarados)
     */
    private DadosBancariosResponseDTO toResponseDTO(DadosBancarios dadosBancarios, Lojista lojista) {
        String docMascarado = dadosBancarios.getTitularDocumento().length() == 11
            ? DadosBancariosResponseDTO.mascaraCpf(dadosBancarios.getTitularDocumento())
            : DadosBancariosResponseDTO.mascaraCnpj(dadosBancarios.getTitularDocumento());

        return new DadosBancariosResponseDTO(
            dadosBancarios.getId(),
            lojista.getId(),
            dadosBancarios.getTitularNome(),
            docMascarado,
            dadosBancarios.getTitularTipo(),
            dadosBancarios.getCodigoBanco(),
            DadosBancariosResponseDTO.getNomeBanco(dadosBancarios.getCodigoBanco()),
            DadosBancariosResponseDTO.mascaraAgencia(dadosBancarios.getAgencia(), dadosBancarios.getAgenciaDv()),
            DadosBancariosResponseDTO.mascaraConta(dadosBancarios.getConta(), dadosBancarios.getContaDv()),
            dadosBancarios.getTipoConta(),
            dadosBancarios.getValidado(),
            lojista.getPagarmeRecipientId() != null && !lojista.getPagarmeRecipientId().isEmpty(),
            dadosBancarios.getCriadoEm(),
            dadosBancarios.getAtualizadoEm()
        );
    }
}
