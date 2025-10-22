package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.VariacaoProdutoRequestDTO;
import com.win.marketplace.dto.response.VariacaoProdutoResponseDTO;
import com.win.marketplace.model.VariacaoProduto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VariacaoProdutoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    VariacaoProduto toEntity(VariacaoProdutoRequestDTO dto);

    @Mapping(source = "produto.id", target = "produtoId")
    VariacaoProdutoResponseDTO toResponseDTO(VariacaoProduto variacaoProduto);

    List<VariacaoProdutoResponseDTO> toResponseDTOList(List<VariacaoProduto> variacoesProduto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    void updateEntityFromDTO(VariacaoProdutoRequestDTO dto, @MappingTarget VariacaoProduto variacaoProduto);
}