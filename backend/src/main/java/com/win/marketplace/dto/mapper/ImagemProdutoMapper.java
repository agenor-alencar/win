package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.ImagemProdutoRequestDTO;
import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.model.ImagemProduto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ImagemProdutoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "dados", ignore = true)
    @Mapping(target = "tamanhoArquivo", ignore = true)
    @Mapping(target = "tipoArquivo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    ImagemProduto toEntity(ImagemProdutoRequestDTO requestDTO);

    @Mapping(source = "produto.id", target = "produtoId")
    ImagemProdutoResponseDTO toResponseDTO(ImagemProduto imagemProduto);

    List<ImagemProdutoResponseDTO> toResponseDTOList(List<ImagemProduto> imagens);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "dados", ignore = true)
    @Mapping(target = "tamanhoArquivo", ignore = true)
    @Mapping(target = "tipoArquivo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    void updateEntityFromDTO(ImagemProdutoRequestDTO requestDTO, @MappingTarget ImagemProduto imagemProduto);
}
