package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.model.ImagemProduto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ImagemProdutoMapper {

    @Mapping(source = "produto.id", target = "produtoId")
    ImagemProdutoResponseDTO toResponseDTO(ImagemProduto imagemProduto);

    List<ImagemProdutoResponseDTO> toResponseDTOList(List<ImagemProduto> imagensProduto);
}
