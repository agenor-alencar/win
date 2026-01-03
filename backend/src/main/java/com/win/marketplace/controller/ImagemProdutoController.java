package com.win.marketplace.controller;

import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.model.ImagemProduto;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.ImagemProdutoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.service.storage.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller para gerenciamento de imagens de produtos
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
@Tag(name = "Imagens de Produtos", description = "Endpoints para upload e gerenciamento de imagens de produtos")
public class ImagemProdutoController {

    private final ImageStorageService imageStorageService;
    private final ProdutoRepository produtoRepository;
    private final ImagemProdutoRepository imagemProdutoRepository;

    private static final List<String> TIPOS_PERMITIDOS = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final long TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10MB

    /**
     * Upload de imagem de produto com geração automática de thumbnails
     */
    @PostMapping(value = "/{produtoId}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Upload de imagem", description = "Faz upload de uma imagem para o produto com geração automática de thumbnails")
    public ResponseEntity<?> uploadImagem(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId,
            @Parameter(description = "Arquivo de imagem") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Texto alternativo (alt)") @RequestParam(required = false) String textoAlternativo,
            @Parameter(description = "Ordem de exibição") @RequestParam(required = false, defaultValue = "0") Integer ordemExibicao) {

        log.info("POST /api/v1/produtos/{}/imagens - Upload de imagem iniciado", produtoId);

        try {
            // Validar arquivo
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio");
            }

            // Validar tamanho
            if (file.getSize() > TAMANHO_MAXIMO) {
                return ResponseEntity.badRequest()
                    .body(String.format("Arquivo muito grande. Máximo: %.2f MB", TAMANHO_MAXIMO / 1024.0 / 1024.0));
            }

            // Validar tipo
            String contentType = file.getContentType();
            if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType.toLowerCase())) {
                return ResponseEntity.badRequest()
                    .body("Tipo de arquivo não permitido. Permitidos: JPG, PNG, WEBP, GIF");
            }

            // Buscar produto
            Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            // Construir caminho da pasta no storage
            String folderPath = String.format("produtos/lojista-%s/produto-%s",
                produto.getLojista().getId().toString(),
                produtoId.toString());

            // Fazer upload com thumbnails
            log.info("Iniciando upload para S3/Storage - Produto: {}", produtoId);
            ImageStorageService.ImageUploadResult uploadResult =
                imageStorageService.uploadImageWithThumbnail(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    contentType,
                    folderPath
                );

            // Criar registro no banco
            ImagemProduto imagem = new ImagemProduto();
            imagem.setProduto(produto);
            imagem.setUrl(uploadResult.getOriginalUrl());
            imagem.setUrlThumbnail(uploadResult.getThumbnailUrl());
            imagem.setUrlMedium(uploadResult.getMediumUrl());
            imagem.setTamanhoBytes(uploadResult.getOriginalSize());
            imagem.setTamanhoThumbnailBytes(uploadResult.getThumbnailSize());
            imagem.setTamanhoMediumBytes(uploadResult.getMediumSize());
            imagem.setTipoConteudo(contentType);
            imagem.setTextoAlternativo(textoAlternativo);
            imagem.setOrdemExibicao(ordemExibicao);

            imagemProdutoRepository.save(imagem);

            log.info("Upload concluído com sucesso - Imagem ID: {}, Original: {} bytes, Thumb: {} bytes",
                imagem.getId(), uploadResult.getOriginalSize(), uploadResult.getThumbnailSize());

            // Retornar DTO
            ImagemProdutoResponseDTO response = toDTO(imagem);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Erro ao fazer upload de imagem para produto {}", produtoId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro ao fazer upload: " + e.getMessage());
        }
    }

    /**
     * Upload de múltiplas imagens de uma vez
     */
    @PostMapping(value = "/{produtoId}/imagens/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Upload de múltiplas imagens", description = "Faz upload de várias imagens de uma vez")
    public ResponseEntity<?> uploadMultiplasImagens(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId,
            @Parameter(description = "Arquivos de imagem") @RequestParam("files") MultipartFile[] files) {

        log.info("POST /api/v1/produtos/{}/imagens/batch - Upload de {} imagens", produtoId, files.length);

        if (files.length > 10) {
            return ResponseEntity.badRequest().body("Máximo de 10 imagens por vez");
        }

        List<ImagemProdutoResponseDTO> resultados = Arrays.stream(files)
            .map(file -> {
                try {
                    ResponseEntity<?> result = uploadImagem(produtoId, file, null, 0);
                    if (result.getStatusCode() == HttpStatus.CREATED) {
                        return (ImagemProdutoResponseDTO) result.getBody();
                    }
                    return null;
                } catch (Exception e) {
                    log.error("Erro ao processar arquivo {}", file.getOriginalFilename(), e);
                    return null;
                }
            })
            .filter(dto -> dto != null)
            .collect(Collectors.toList());

        log.info("Upload em lote concluído - {} de {} imagens processadas com sucesso",
            resultados.size(), files.length);

        return ResponseEntity.status(HttpStatus.CREATED).body(resultados);
    }

    /**
     * Listar imagens de um produto
     */
    @GetMapping("/{produtoId}/imagens")
    @Operation(summary = "Listar imagens", description = "Lista todas as imagens de um produto")
    public ResponseEntity<List<ImagemProdutoResponseDTO>> listarImagens(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId) {

        log.info("GET /api/v1/produtos/{}/imagens", produtoId);

        List<ImagemProduto> imagens = imagemProdutoRepository.findByProdutoIdOrderByOrdemExibicaoAsc(produtoId);
        List<ImagemProdutoResponseDTO> response = imagens.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Atualizar metadados de uma imagem
     */
    @PutMapping("/{produtoId}/imagens/{imagemId}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Atualizar metadados", description = "Atualiza texto alternativo e ordem de uma imagem")
    public ResponseEntity<?> atualizarImagem(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId,
            @Parameter(description = "ID da imagem") @PathVariable UUID imagemId,
            @Parameter(description = "Texto alternativo") @RequestParam(required = false) String textoAlternativo,
            @Parameter(description = "Ordem de exibição") @RequestParam(required = false) Integer ordemExibicao) {

        log.info("PUT /api/v1/produtos/{}/imagens/{}", produtoId, imagemId);

        ImagemProduto imagem = imagemProdutoRepository.findById(imagemId)
            .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        if (!imagem.getProduto().getId().equals(produtoId)) {
            return ResponseEntity.badRequest().body("Imagem não pertence a este produto");
        }

        if (textoAlternativo != null) {
            imagem.setTextoAlternativo(textoAlternativo);
        }
        if (ordemExibicao != null) {
            imagem.setOrdemExibicao(ordemExibicao);
        }

        imagemProdutoRepository.save(imagem);

        return ResponseEntity.ok(toDTO(imagem));
    }

    /**
     * Deletar uma imagem
     */
    @DeleteMapping("/{produtoId}/imagens/{imagemId}")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Deletar imagem", description = "Remove uma imagem do produto e do storage")
    public ResponseEntity<?> deletarImagem(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId,
            @Parameter(description = "ID da imagem") @PathVariable UUID imagemId) {

        log.info("DELETE /api/v1/produtos/{}/imagens/{}", produtoId, imagemId);

        ImagemProduto imagem = imagemProdutoRepository.findById(imagemId)
            .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        if (!imagem.getProduto().getId().equals(produtoId)) {
            return ResponseEntity.badRequest().body("Imagem não pertence a este produto");
        }

        // Remover do storage (S3/local)
        try {
            boolean deletado = imageStorageService.deleteImage(imagem.getUrl());
            if (!deletado) {
                log.warn("Imagem não encontrada no storage: {}", imagem.getUrl());
            }
        } catch (Exception e) {
            log.error("Erro ao remover imagem do storage", e);
        }

        // Remover do banco
        imagemProdutoRepository.delete(imagem);

        log.info("Imagem {} removida com sucesso", imagemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Definir imagem principal (ordem 0)
     */
    @PatchMapping("/{produtoId}/imagens/{imagemId}/principal")
    @PreAuthorize("hasAnyRole('LOJISTA', 'ADMIN')")
    @Operation(summary = "Definir imagem principal", description = "Define uma imagem como principal (ordem 0)")
    public ResponseEntity<?> definirImagemPrincipal(
            @Parameter(description = "ID do produto") @PathVariable UUID produtoId,
            @Parameter(description = "ID da imagem") @PathVariable UUID imagemId) {

        log.info("PATCH /api/v1/produtos/{}/imagens/{}/principal", produtoId, imagemId);

        ImagemProduto imagem = imagemProdutoRepository.findById(imagemId)
            .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        if (!imagem.getProduto().getId().equals(produtoId)) {
            return ResponseEntity.badRequest().body("Imagem não pertence a este produto");
        }

        // Resetar ordem de todas as outras imagens
        List<ImagemProduto> todasImagens = imagemProdutoRepository.findByProdutoIdOrderByOrdemExibicaoAsc(produtoId);
        todasImagens.forEach(img -> {
            if (img.getOrdemExibicao() == 0 && !img.getId().equals(imagemId)) {
                img.setOrdemExibicao(1);
                imagemProdutoRepository.save(img);
            }
        });

        // Definir como principal
        imagem.setOrdemExibicao(0);
        imagemProdutoRepository.save(imagem);

        log.info("Imagem {} definida como principal do produto {}", imagemId, produtoId);
        return ResponseEntity.ok(toDTO(imagem));
    }

    private ImagemProdutoResponseDTO toDTO(ImagemProduto imagem) {
        return imagemProdutoMapper.toDTO(imagem);
    }
}
