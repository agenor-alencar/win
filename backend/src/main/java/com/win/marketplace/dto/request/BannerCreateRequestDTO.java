package com.win.marketplace.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de banner
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dados para criação de um novo banner")
public class BannerCreateRequestDTO {

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
    @Schema(description = "Título do banner", example = "Ferragens e Ferramentas")
    private String titulo;

    @Size(max = 500, message = "Subtítulo deve ter no máximo 500 caracteres")
    @Schema(description = "Subtítulo ou descrição do banner", example = "As melhores marcas: Ingco, Bosch, Makita")
    private String subtitulo;

    @Size(max = 1000, message = "Link deve ter no máximo 1000 caracteres")
    @Schema(description = "URL de destino ao clicar no banner", example = "/categoria/ferragens")
    private String linkUrl;

    @NotNull(message = "Ordem é obrigatória")
    @Schema(description = "Ordem de exibição (menor = primeiro)", example = "1")
    private Integer ordem;

    @Schema(description = "Se o banner está ativo", example = "true")
    private Boolean ativo = true;
}
