package com.win.marketplace.controller;

import com.win.marketplace.model.Lojista;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.service.PagarMeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller para gerenciar recipients (recebedores) do Pagar.me
 * Usado por admins para configurar split de pagamento
 */
@RestController
@RequestMapping("/api/v1/admin/recipients")
@RequiredArgsConstructor
@Slf4j
public class AdminRecipientController {

    private final PagarMeService pagarMeService;
    private final LojistaRepository lojistaRepository;

    /**
     * DTO para criação de recipient
     */
    public record CriarRecipientRequest(
        String nome,
        String documento,
        String email,
        String tipo, // "individual" ou "company"
        Map<String, String> dadosBancarios
    ) {}

    /**
     * DTO para vincular recipient a lojista
     */
    public record VincularRecipientRequest(
        UUID lojistaId,
        String recipientId
    ) {}

    /**
     * Cria um recipient no Pagar.me para um lojista
     * 
     * @param request Dados do lojista e bancários
     * @return ID do recipient criado
     */
    @PostMapping("/criar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> criarRecipient(
        @Valid @RequestBody CriarRecipientRequest request
    ) {
        log.info("🏦 Admin criando recipient - Nome: {}, Documento: {}", 
            request.nome, request.documento);

        try {
            Map<String, Object> resultado = pagarMeService.criarRecipient(
                request.nome,
                request.documento,
                request.email,
                request.tipo,
                request.dadosBancarios
            );

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Erro ao criar recipient: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erro ao criar recipient",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Vincula um recipient existente a um lojista
     * 
     * @param request lojistaId e recipientId
     * @return Confirmação
     */
    @PostMapping("/vincular")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> vincularRecipientALojista(
        @Valid @RequestBody VincularRecipientRequest request
    ) {
        log.info("🔗 Admin vinculando recipient {} ao lojista {}", 
            request.recipientId, request.lojistaId);

        try {
@SuppressWarnings("null")
            Lojista lojista = lojistaRepository.findById(request.lojistaId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

            // Validar recipient no Pagar.me
            Map<String, Object> recipientData = pagarMeService.buscarRecipient(request.recipientId);
            log.info("✅ Recipient validado: {}", recipientData.get("name"));

            // Vincular no banco
            lojista.setPagarmeRecipientId(request.recipientId);
            lojistaRepository.save(lojista);

            log.info("✅ Recipient vinculado com sucesso!");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Recipient vinculado com sucesso",
                "lojista", lojista.getNomeFantasia(),
                "recipientId", request.recipientId
            ));

        } catch (Exception e) {
            log.error("❌ Erro ao vincular recipient: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erro ao vincular recipient",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Lista todos os lojistas e seus recipients
     * 
     * @return Lista com dados dos lojistas e recipients
     */
    @GetMapping("/lojistas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> listarLojistasComRecipients() {
        log.info("📋 Admin listando lojistas e recipients");

        List<Lojista> lojistas = lojistaRepository.findAll();
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (Lojista lojista : lojistas) {
            Map<String, Object> lojistaData = new HashMap<>();
            lojistaData.put("id", lojista.getId());
            lojistaData.put("nomeFantasia", lojista.getNomeFantasia());
            lojistaData.put("cnpj", lojista.getCnpj());
            lojistaData.put("email", lojista.getUsuario() != null ? lojista.getUsuario().getEmail() : null);
            lojistaData.put("recipientId", lojista.getPagarmeRecipientId());
            lojistaData.put("temRecipient", lojista.getPagarmeRecipientId() != null);
            lojistaData.put("ativo", lojista.getAtivo());
            resultado.add(lojistaData);
        }

        return ResponseEntity.ok(resultado);
    }

    /**
     * Busca informações de um recipient no Pagar.me
     * 
     * @param recipientId ID do recipient
     * @return Dados do recipient
     */
    @GetMapping("/{recipientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> buscarRecipient(
        @PathVariable String recipientId
    ) {
        log.info("🔍 Admin buscando recipient: {}", recipientId);

        try {
            Map<String, Object> recipient = pagarMeService.buscarRecipient(recipientId);
            return ResponseEntity.ok(recipient);

        } catch (Exception e) {
            log.error("❌ Erro ao buscar recipient: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erro ao buscar recipient",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Remove o vínculo de recipient de um lojista
     * 
     * @param lojistaId ID do lojista
     * @return Confirmação
     */
    @DeleteMapping("/lojista/{lojistaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> removerRecipientDeLojista(
        @PathVariable UUID lojistaId
    ) {
        log.info("🗑️ Admin removendo recipient do lojista {}", lojistaId);

        try {
            Lojista lojista = lojistaRepository.findById(lojistaId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

            String recipientAnterior = lojista.getPagarmeRecipientId();
            lojista.setPagarmeRecipientId(null);
            lojistaRepository.save(lojista);

            log.info("✅ Recipient removido do lojista {}", lojista.getNomeFantasia());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Recipient removido com sucesso",
                "recipientIdAnterior", recipientAnterior != null ? recipientAnterior : "nenhum"
            ));

        } catch (Exception e) {
            log.error("❌ Erro ao remover recipient: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erro ao remover recipient",
                "message", e.getMessage()
            ));
        }
    }
}
