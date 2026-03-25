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
    @Mapping(target = "subtotal", expression = "java(java.math.BigDecimal.valueOf(requestDTO.quantidade()).multiply(requestDTO.precoUnitario()))")
    ItemPedido toEntity(ItemPedidoRequestDTO requestDTO);

    @Mapping(source = "pedido.id", target = "pedidoId")
    @Mapping(source = "produto.id", target = "produtoId")
    @Mapping(source = "produto.nome", target = "produtoNome")
    @Mapping(target = "produtoImagem", expression = "java(getPrimeiraImagemProduto(itemPedido))")
    @Mapping(source = "variacao.id", target = "variacaoProdutoId")
    ItemPedidoResponseDTO toResponseDTO(ItemPedido itemPedido);

    List<ItemPedidoResponseDTO> toResponseDTOList(List<ItemPedido> itens);

    /**
     * Obtém a URL da primeira imagem do produto
     */
    default String getPrimeiraImagemProduto(ItemPedido itemPedido) {
        if (itemPedido.getProduto() != null && itemPedido.getProduto().getImagens() != null) {
            return itemPedido.getProduto().getImagens().stream()
                .findFirst()
                .map(imagem -> imagem.getUrl())
                .orElse(null);
        }
        return null;
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "variacao", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "nomeProduto", ignore = true)
    @Mapping(target = "quantidade", ignore = true)
    @Mapping(target = "precoUnitario", ignore = true)
    @Mapping(target = "precoTotal", ignore = true)
    @Mapping(target = "subtotal", expression = "java(java.math.BigDecimal.valueOf(requestDTO.quantidade()).multiply(requestDTO.precoUnitario()))")
    void updateEntityFromDTO(ItemPedidoRequestDTO requestDTO, @MappingTarget ItemPedido itemPedido);
}
