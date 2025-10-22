package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.model.Pagamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PagamentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "status", constant = "PENDENTE")
    Pagamento toEntity(PagamentoRequestDTO requestDTO);

    @Mapping(source = "pedido.id", target = "pedidoId")
    @Mapping(source = "pedido.numeroPedido", target = "numeroPedido")
    PagamentoResponseDTO toResponseDTO(Pagamento pagamento);

    List<PagamentoResponseDTO> toResponseDTOList(List<Pagamento> pagamentos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntityFromDTO(PagamentoRequestDTO requestDTO, @MappingTarget Pagamento pagamento);
}
