package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.EntregadorCreateRequestDTO;
import com.win.marketplace.dto.response.EntregadorResponseDTO;
import com.win.marketplace.model.Entregador;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EntregadorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "disponivel", constant = "true")
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    Entregador toEntity(EntregadorCreateRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "usuario.email", target = "usuarioEmail")
    EntregadorResponseDTO toResponseDTO(Entregador entregador);

    List<EntregadorResponseDTO> toResponseDTOList(List<Entregador> entregadores);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    void updateEntityFromDTO(EntregadorCreateRequestDTO requestDTO, @MappingTarget Entregador entregador);
}
