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
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "itens", ignore = true)
    VariacaoProduto toEntity(VariacaoProdutoRequestDTO requestDTO);

    @Mapping(source = "produto.id", target = "produtoId")
    VariacaoProdutoResponseDTO toResponseDTO(VariacaoProduto variacaoProduto);

    List<VariacaoProdutoResponseDTO> toResponseDTOList(List<VariacaoProduto> variacoes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "itens", ignore = true)
    void updateEntityFromDTO(VariacaoProdutoRequestDTO requestDTO, @MappingTarget VariacaoProduto variacaoProduto);
}
