package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.BannerCreateRequestDTO;
import com.win.marketplace.dto.request.BannerUpdateRequestDTO;
import com.win.marketplace.dto.response.BannerResponseDTO;
import com.win.marketplace.model.Banner;
import org.springframework.stereotype.Component;

/**
 * Mapper para conversão entre entidade Banner e DTOs
 */
@Component
public class BannerMapper {

    /**
     * Converte entidade Banner para DTO de resposta
     */
    public BannerResponseDTO toResponseDTO(Banner banner) {
        if (banner == null) {
            return null;
        }

        BannerResponseDTO dto = new BannerResponseDTO();
        dto.setId(banner.getId());
        dto.setTitulo(banner.getTitulo());
        dto.setSubtitulo(banner.getSubtitulo());
        dto.setImagemUrl(banner.getImagemUrl());
        dto.setLinkUrl(banner.getLinkUrl());
        dto.setOrdem(banner.getOrdem());
        dto.setAtivo(banner.getAtivo());
        dto.setCriadoEm(banner.getCriadoEm());
        dto.setAtualizadoEm(banner.getAtualizadoEm());

        return dto;
    }

    /**
     * Converte DTO de criação para entidade Banner
     */
    public Banner toEntity(BannerCreateRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Banner banner = new Banner();
        banner.setTitulo(dto.getTitulo());
        banner.setSubtitulo(dto.getSubtitulo());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setOrdem(dto.getOrdem());
        banner.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        return banner;
    }

    /**
     * Atualiza uma entidade Banner existente com dados do DTO de atualização
     */
    public void updateEntity(Banner banner, BannerUpdateRequestDTO dto) {
        if (banner == null || dto == null) {
            return;
        }

        if (dto.getTitulo() != null) {
            banner.setTitulo(dto.getTitulo());
        }
        if (dto.getSubtitulo() != null) {
            banner.setSubtitulo(dto.getSubtitulo());
        }
        if (dto.getLinkUrl() != null) {
            banner.setLinkUrl(dto.getLinkUrl());
        }
        if (dto.getOrdem() != null) {
            banner.setOrdem(dto.getOrdem());
        }
        if (dto.getAtivo() != null) {
            banner.setAtivo(dto.getAtivo());
        }
    }
}
