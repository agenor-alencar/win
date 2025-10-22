package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.ItemPedidoRequestDTO;
import com.win.marketplace.dto.response.ItemPedidoResponseDTO;
import com.win.marketplace.model.ItemPedido;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ItemPedidoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "variacao", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "nomeProduto", ignore = true)
    @Mapping(target = "quantidade", ignore = true)
    @Mapping(target = "precoUnitario", ignore = true)
    @Mapping(target = "precoTotal", ignore = true)
    ItemPedido toEntity(ItemPedidoRequestDTO requestDTO);

    @Mapping(source = "pedido.id", target = "pedidoId")
    @Mapping(source = "produto.id", target = "produtoId")
    @Mapping(source = "produto.nome", target = "produtoNome")
    @Mapping(source = "variacao.id", target = "variacaoProdutoId")
    ItemPedidoResponseDTO toResponseDTO(ItemPedido itemPedido);

    List<ItemPedidoResponseDTO> toResponseDTOList(List<ItemPedido> itens);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "variacao", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "nomeProduto", ignore = true)
    @Mapping(target = "quantidade", ignore = true)
    @Mapping(target = "precoUnitario", ignore = true)
    @Mapping(target = "precoTotal", ignore = true)
    void updateEntityFromDTO(ItemPedidoRequestDTO requestDTO, @MappingTarget ItemPedido itemPedido);
}
