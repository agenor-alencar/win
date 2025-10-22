package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record ImagemProdutoRequestDTO(
    UUID produtoId,
    
    @NotBlank(message = "URL da imagem é obrigatória")
    String url,
    
    Boolean principal,
    
    String nomeArquivo,
    
    String tipoArquivo,
    
    Long tamanhoArquivo,
    
    Integer ordemExibicao
) {}
