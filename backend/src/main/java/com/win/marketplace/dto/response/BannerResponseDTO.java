package com.win.marketplace.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de resposta para banner
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados de um banner")
public class BannerResponseDTO {

    @Schema(description = "ID do banner", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Título do banner", example = "Ferragens e Ferramentas")
    private String titulo;

    @Schema(description = "Subtítulo do banner", example = "As melhores marcas: Ingco, Bosch, Makita")
    private String subtitulo;

    @Schema(description = "URL da imagem no DigitalOcean Spaces", 
            example = "https://win-marketplace-storage.sfo3.digitaloceanspaces.com/banners/banner-ferragens.jpg")
    private String imagemUrl;

    @Schema(description = "URL de destino ao clicar", example = "/categoria/ferragens")
    private String linkUrl;

    @Schema(description = "Ordem de exibição", example = "1")
    private Integer ordem;

    @Schema(description = "Se o banner está ativo", example = "true")
    private Boolean ativo;

    @Schema(description = "Data de criação")
    private OffsetDateTime criadoEm;

    @Schema(description = "Data da última atualização")
    private OffsetDateTime atualizadoEm;
}
