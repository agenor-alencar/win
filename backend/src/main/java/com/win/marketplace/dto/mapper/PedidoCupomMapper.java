package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.response.PedidoCupomResponseDTO;
import com.win.marketplace.model.PedidoCupom;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PedidoCupomMapper {

    @Mapping(source = "pedido.id", target = "pedidoId")
    @Mapping(source = "cupom.id", target = "cupomId")
    @Mapping(source = "cupom.codigo", target = "cupomCodigo")
    @Mapping(source = "cupom.valorDesconto", target = "valorDesconto")
    @Mapping(source = "cupom.tipoDesconto", target = "tipoDesconto")
    PedidoCupomResponseDTO toResponseDTO(PedidoCupom pedidoCupom);

    List<PedidoCupomResponseDTO> toResponseDTOList(List<PedidoCupom> pedidoCupons);
}
