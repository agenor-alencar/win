package com.win.marketplace.controller;

import com.win.marketplace.dto.request.BannerCreateRequestDTO;
import com.win.marketplace.dto.request.BannerUpdateRequestDTO;
import com.win.marketplace.dto.response.BannerResponseDTO;
import com.win.marketplace.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Controller para gerenciamento de banners
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Endpoints para gerenciamento de banners da home page")
public class BannerController {

    private final BannerService bannerService;

    /**
     * Lista banners ativos (público)
     */
    @GetMapping("/api/v1/banners")
    @Operation(summary = "Listar banners ativos", description = "Retorna todos os banners ativos ordenados por ordem de exibição")
    public ResponseEntity<List<BannerResponseDTO>> listarBannersAtivos() {
        log.info("GET /api/v1/banners - Listando banners ativos");
        List<BannerResponseDTO> banners = bannerService.listarBannersAtivos();
        return ResponseEntity.ok(banners);
    }

    /**
     * Lista todos os banners (admin)
     */
    @GetMapping("/api/v1/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos os banners (Admin)", description = "Retorna todos os banners incluindo inativos")
    public ResponseEntity<List<BannerResponseDTO>> listarTodosBanners() {
        log.info("GET /api/v1/admin/banners - Listando todos os banners");
        List<BannerResponseDTO> banners = bannerService.listarTodosBanners();
        return ResponseEntity.ok(banners);
    }

    /**
     * Busca um banner por ID
     */
    @GetMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Buscar banner por ID (Admin)")
    public ResponseEntity<BannerResponseDTO> buscarBanner(
            @Parameter(description = "ID do banner") @PathVariable UUID id) {
        log.info("GET /api/v1/admin/banners/{} - Buscando banner", id);
        BannerResponseDTO banner = bannerService.buscarPorId(id);
        return ResponseEntity.ok(banner);
    }

    /**
     * Cria um novo banner com upload de imagem
     */
    @PostMapping(value = "/api/v1/admin/banners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar banner (Admin)", description = "Cria um novo banner com upload de imagem para o DigitalOcean Spaces")
    public ResponseEntity<?> criarBanner(
            @Parameter(description = "Título do banner") @RequestParam String titulo,
            @Parameter(description = "Subtítulo do banner") @RequestParam(required = false) String subtitulo,
            @Parameter(description = "URL de destino") @RequestParam(required = false) String linkUrl,
            @Parameter(description = "Ordem de exibição") @RequestParam Integer ordem,
            @Parameter(description = "Se o banner está ativo") @RequestParam(required = false, defaultValue = "true") Boolean ativo,
            @Parameter(description = "Arquivo de imagem") @RequestParam("file") MultipartFile file) {

        log.info("POST /api/v1/admin/banners - Criando novo banner: {}", titulo);

        try {
            // Validar tamanho (máximo 10MB para banners)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Arquivo muito grande. Máximo: 10MB");
            }

            // Montar DTO
            BannerCreateRequestDTO dto = new BannerCreateRequestDTO();
            dto.setTitulo(titulo);
            dto.setSubtitulo(subtitulo);
            dto.setLinkUrl(linkUrl);
            dto.setOrdem(ordem);
            dto.setAtivo(ativo);

            BannerResponseDTO banner = bannerService.criarBanner(dto, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(banner);

        } catch (IllegalArgumentException e) {
            log.error("Erro de validação ao criar banner: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao criar banner", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao criar banner: " + e.getMessage());
        }
    }

    /**
     * Atualiza dados de um banner (sem imagem)
     */
    @PutMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar banner (Admin)", description = "Atualiza os dados de um banner existente")
    public ResponseEntity<?> atualizarBanner(
            @Parameter(description = "ID do banner") @PathVariable UUID id,
            @Valid @RequestBody BannerUpdateRequestDTO dto) {

        log.info("PUT /api/v1/admin/banners/{} - Atualizando banner", id);

        try {
            BannerResponseDTO banner = bannerService.atualizarBanner(id, dto);
            return ResponseEntity.ok(banner);
        } catch (RuntimeException e) {
            log.error("Erro ao atualizar banner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao atualizar banner", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar banner: " + e.getMessage());
        }
    }

    /**
     * Atualiza apenas a imagem de um banner
     */
    @PutMapping(value = "/api/v1/admin/banners/{id}/imagem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar imagem do banner (Admin)", description = "Substitui a imagem de um banner existente")
    public ResponseEntity<?> atualizarImagemBanner(
            @Parameter(description = "ID do banner") @PathVariable UUID id,
            @Parameter(description = "Nova imagem") @RequestParam("file") MultipartFile file) {

        log.info("PUT /api/v1/admin/banners/{}/imagem - Atualizando imagem", id);

        try {
            // Validar tamanho
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Arquivo muito grande. Máximo: 10MB");
            }

            BannerResponseDTO banner = bannerService.atualizarImagemBanner(id, file);
            return ResponseEntity.ok(banner);

        } catch (RuntimeException e) {
            log.error("Erro ao atualizar imagem do banner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao atualizar imagem do banner", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar imagem: " + e.getMessage());
        }
    }

    /**
     * Ativa/desativa um banner
     */
    @PatchMapping("/api/v1/admin/banners/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar/Desativar banner (Admin)", description = "Alterna o status ativo de um banner")
    public ResponseEntity<?> toggleAtivoBanner(@Parameter(description = "ID do banner") @PathVariable UUID id) {
        log.info("PATCH /api/v1/admin/banners/{}/toggle - Alternando status", id);

        try {
            BannerResponseDTO banner = bannerService.toggleAtivo(id);
            return ResponseEntity.ok(banner);
        } catch (RuntimeException e) {
            log.error("Erro ao alternar status do banner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao alternar status do banner", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao alternar status: " + e.getMessage());
        }
    }

    /**
     * Deleta um banner
     */
    @DeleteMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deletar banner (Admin)", description = "Remove um banner e sua imagem do storage")
    public ResponseEntity<?> deletarBanner(@Parameter(description = "ID do banner") @PathVariable UUID id) {
        log.info("DELETE /api/v1/admin/banners/{} - Deletando banner", id);

        try {
            bannerService.deletarBanner(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Erro ao deletar banner: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao deletar banner", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao deletar banner: " + e.getMessage());
        }
    }
}
