package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.AvaliacaoProdutoCreateRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoProdutoResponseDTO;
import com.win.marketplace.model.AvaliacaoProduto;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AvaliacaoProdutoMapper {

    /**
     * Converte CreateDTO para Entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    AvaliacaoProduto toEntity(AvaliacaoProdutoCreateRequestDTO requestDTO);

    /**
     * Converte Entity para ResponseDTO
     */
    @Mapping(target = "produto", source = "produto")
    @Mapping(target = "usuario", source = "usuario")
    AvaliacaoProdutoResponseDTO toResponseDTO(AvaliacaoProduto avaliacaoProduto);

    /**
     * Mapeia Produto para ProdutoBasicInfoDTO
     */
    AvaliacaoProdutoResponseDTO.ProdutoBasicInfoDTO toProdutoBasicInfo(
        com.win.marketplace.model.Produto produto
    );

    /**
     * Mapeia Usuario para UsuarioBasicInfoDTO
     */
    AvaliacaoProdutoResponseDTO.UsuarioBasicInfoDTO toUsuarioBasicInfo(
        com.win.marketplace.model.Usuario usuario
    );
}
