package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.PedidoCreateRequestDTO;
import com.win.marketplace.dto.response.PedidoResponseDTO;
import com.win.marketplace.model.Pedido;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ItemPedidoMapper.class})
public interface PedidoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numeroPedido", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "motorista", ignore = true)
    @Mapping(target = "enderecoEntrega", ignore = true)
    @Mapping(target = "status", constant = "PENDENTE")
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "desconto", constant = "0.0")
    @Mapping(target = "frete", constant = "0.0")
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "pagamento", ignore = true)
    @Mapping(target = "notaFiscal", ignore = true)
    @Mapping(target = "codigoEntrega", ignore = true)
    @Mapping(target = "pesoTotalKg", ignore = true)
    @Mapping(target = "volumeTotalM3", ignore = true)
    @Mapping(target = "maiorDimensaoCm", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "confirmadoEm", ignore = true)
    @Mapping(target = "entregueEm", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "cuponsAplicados", ignore = true)
    Pedido toEntity(PedidoCreateRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "motorista.id", target = "motoristaId")
    @Mapping(source = "motorista.usuario.nome", target = "motoristaNome")
    PedidoResponseDTO toResponseDTO(Pedido pedido);

    List<PedidoResponseDTO> toResponseDTOList(List<Pedido> pedidos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numeroPedido", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "motorista", ignore = true)
    @Mapping(target = "enderecoEntrega", ignore = true)
    @Mapping(target = "pagamento", ignore = true)
    @Mapping(target = "notaFiscal", ignore = true)
    @Mapping(target = "codigoEntrega", ignore = true)
    @Mapping(target = "pesoTotalKg", ignore = true)
    @Mapping(target = "volumeTotalM3", ignore = true)
    @Mapping(target = "maiorDimensaoCm", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "confirmadoEm", ignore = true)
    @Mapping(target = "entregueEm", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "cuponsAplicados", ignore = true)
    void updateEntityFromDTO(PedidoCreateRequestDTO requestDTO, @MappingTarget Pedido pedido);
}
