package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.PedidoCreateRequestDTO;
import com.win.marketplace.dto.response.PedidoResponseDTO;
import com.win.marketplace.model.Pedido;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ItemPedidoMapper.class, EnderecoMapper.class, PagamentoMapper.class})
public interface PedidoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "enderecoEntrega", ignore = true)
    @Mapping(target = "entregador", ignore = true)
    @Mapping(target = "status", constant = "PENDENTE")
    @Mapping(target = "valorTotal", ignore = true)
    @Mapping(target = "valorDesconto", constant = "0.0")
    @Mapping(target = "valorFinal", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "pagamento", ignore = true)
    @Mapping(target = "pedidoCupons", ignore = true)
    @Mapping(target = "notaFiscal", ignore = true)
    @Mapping(target = "dataPedido", ignore = true)
    @Mapping(target = "dataConfirmacao", ignore = true)
    @Mapping(target = "dataEntrega", ignore = true)
    Pedido toEntity(PedidoCreateRequestDTO requestDTO);

    @Mapping(source = "cliente.id", target = "clienteId")
    @Mapping(source = "cliente.nome", target = "clienteNome")
    PedidoResponseDTO toResponseDTO(Pedido pedido);

    List<PedidoResponseDTO> toResponseDTOList(List<Pedido> pedidos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "enderecoEntrega", ignore = true)
    @Mapping(target = "entregador", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "pagamento", ignore = true)
    @Mapping(target = "pedidoCupons", ignore = true)
    @Mapping(target = "notaFiscal", ignore = true)
    @Mapping(target = "dataPedido", ignore = true)
    @Mapping(target = "dataConfirmacao", ignore = true)
    @Mapping(target = "dataEntrega", ignore = true)
    void updateEntityFromDTO(PedidoCreateRequestDTO requestDTO, @MappingTarget Pedido pedido);
}
