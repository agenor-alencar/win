package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.response.ImagemProdutoResponseDTO;
import com.win.marketplace.model.ImagemProduto;
import org.mapstruct.Mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ImagemProdutoMapper {

    ImagemProdutoResponseDTO toResponseDTO(ImagemProduto imagemProduto);

    List<ImagemProdutoResponseDTO> toResponseDTOList(List<ImagemProduto> imagensProduto);
    
    default LocalDateTime map(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? offsetDateTime.toLocalDateTime() : null;
    }
}
