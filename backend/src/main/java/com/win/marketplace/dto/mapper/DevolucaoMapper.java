package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.DevolucaoCreateRequestDTO;
import com.win.marketplace.dto.response.DevolucaoResponseDTO;
import com.win.marketplace.model.Devolucao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DevolucaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numeroDevolucao", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "itemPedido", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "status", constant = "PENDENTE")
    @Mapping(target = "justificativaLojista", ignore = true)
    @Mapping(target = "dataAprovacao", ignore = true)
    @Mapping(target = "dataRecusa", ignore = true)
    @Mapping(target = "dataReembolso", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    Devolucao toEntity(DevolucaoCreateRequestDTO requestDTO);

    @Mapping(source = "pedido.id", target = "pedidoId")
    @Mapping(source = "pedido.numeroPedido", target = "numeroPedido")
    @Mapping(source = "itemPedido.id", target = "itemPedidoId")
    @Mapping(source = "itemPedido.produto.id", target = "produtoId")
    @Mapping(source = "itemPedido.produto.nome", target = "produtoNome")
    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "usuario.email", target = "usuarioEmail")
    @Mapping(source = "lojista.id", target = "lojistaId")
    @Mapping(source = "lojista.nomeFantasia", target = "lojistaNome")
    DevolucaoResponseDTO toResponseDTO(Devolucao devolucao);

    List<DevolucaoResponseDTO> toResponseDTOList(List<Devolucao> devolucoes);
}
