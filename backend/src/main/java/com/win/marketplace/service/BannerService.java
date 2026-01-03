package com.win.marketplace.service;

import com.win.marketplace.dto.mapper.BannerMapper;
import com.win.marketplace.dto.request.BannerCreateRequestDTO;
import com.win.marketplace.dto.request.BannerUpdateRequestDTO;
import com.win.marketplace.dto.response.BannerResponseDTO;
import com.win.marketplace.model.Banner;
import com.win.marketplace.repository.BannerRepository;
import com.win.marketplace.service.storage.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service para gerenciamento de banners
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final ImageStorageService imageStorageService;

    /**
     * Busca todos os banners ativos (para exibição pública)
     */
    @Transactional(readOnly = true)
    public List<BannerResponseDTO> listarBannersAtivos() {
        log.info("Buscando banners ativos");
        List<Banner> banners = bannerRepository.findByAtivoTrueOrderByOrdemAsc();
        return banners.stream()
                .map(bannerMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca todos os banners (para admin)
     */
    @Transactional(readOnly = true)
    public List<BannerResponseDTO> listarTodosBanners() {
        log.info("Buscando todos os banners");
        List<Banner> banners = bannerRepository.findAllByOrderByOrdemAsc();
        return banners.stream()
                .map(bannerMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca um banner por ID
     */
    @Transactional(readOnly = true)
    public BannerResponseDTO buscarPorId(UUID id) {
        log.info("Buscando banner por ID: {}", id);
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner não encontrado"));
        return bannerMapper.toResponseDTO(banner);
    }

    /**
     * Cria um novo banner com upload de imagem
     */
    @Transactional
    public BannerResponseDTO criarBanner(BannerCreateRequestDTO dto, MultipartFile file) throws Exception {
        log.info("Criando novo banner: {}", dto.getTitulo());

        // Validar arquivo
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        // Validar tipo de arquivo
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Arquivo deve ser uma imagem");
        }

        // Upload da imagem para o DigitalOcean Spaces
        String folderPath = "banners";
        String imagemUrl = imageStorageService.uploadImage(
                file.getInputStream(),
                file.getOriginalFilename(),
                contentType,
                folderPath
        );

        // Criar entidade
        Banner banner = bannerMapper.toEntity(dto);
        banner.setImagemUrl(imagemUrl);

        // Salvar no banco
        banner = bannerRepository.save(banner);
        log.info("Banner criado com sucesso: ID={}, URL={}", banner.getId(), imagemUrl);

        return bannerMapper.toResponseDTO(banner);
    }

    /**
     * Atualiza um banner existente
     */
    @Transactional
    public BannerResponseDTO atualizarBanner(UUID id, BannerUpdateRequestDTO dto) {
        log.info("Atualizando banner: {}", id);

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner não encontrado"));

        bannerMapper.updateEntity(banner, dto);
        banner = bannerRepository.save(banner);

        log.info("Banner atualizado com sucesso: {}", id);
        return bannerMapper.toResponseDTO(banner);
    }

    /**
     * Atualiza a imagem de um banner existente
     */
    @Transactional
    public BannerResponseDTO atualizarImagemBanner(UUID id, MultipartFile file) throws Exception {
        log.info("Atualizando imagem do banner: {}", id);

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner não encontrado"));

        // Validar arquivo
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Arquivo deve ser uma imagem");
        }

        // Deletar imagem antiga (opcional)
        try {
            imageStorageService.deleteImage(banner.getImagemUrl());
        } catch (Exception e) {
            log.warn("Erro ao deletar imagem antiga: {}", e.getMessage());
        }

        // Upload da nova imagem
        String folderPath = "banners";
        String novaImagemUrl = imageStorageService.uploadImage(
                file.getInputStream(),
                file.getOriginalFilename(),
                contentType,
                folderPath
        );

        banner.setImagemUrl(novaImagemUrl);
        banner = bannerRepository.save(banner);

        log.info("Imagem do banner atualizada com sucesso: {}", id);
        return bannerMapper.toResponseDTO(banner);
    }

    /**
     * Deleta um banner
     */
    @Transactional
    public void deletarBanner(UUID id) {
        log.info("Deletando banner: {}", id);

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner não encontrado"));

        // Deletar imagem do storage (opcional)
        try {
            imageStorageService.deleteImage(banner.getImagemUrl());
        } catch (Exception e) {
            log.warn("Erro ao deletar imagem: {}", e.getMessage());
        }

        bannerRepository.delete(banner);
        log.info("Banner deletado com sucesso: {}", id);
    }

    /**
     * Ativa ou desativa um banner
     */
    @Transactional
    public BannerResponseDTO toggleAtivo(UUID id) {
        log.info("Alterando status ativo do banner: {}", id);

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner não encontrado"));

        banner.setAtivo(!banner.getAtivo());
        banner = bannerRepository.save(banner);

        log.info("Status do banner alterado: ID={}, Ativo={}", id, banner.getAtivo());
        return bannerMapper.toResponseDTO(banner);
    }
}
