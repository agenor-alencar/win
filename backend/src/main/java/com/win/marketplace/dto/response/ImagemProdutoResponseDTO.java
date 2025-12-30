package com.win.marketplace.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de resposta para imagens de produtos
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagemProdutoResponseDTO {
    
    private UUID id;
    
    private String url;
    
    private String urlThumbnail;
    
    private String urlMedium;
    
    private Long tamanhoBytes;
    
    private Long tamanhoThumbnailBytes;
    
    private Long tamanhoMediumBytes;
    
    private String tipoConteudo;
    
    private String textoAlternativo;
    
    private Integer ordemExibicao;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime criadoEm;
}
