package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.MotoristaCreateRequestDTO;
import com.win.marketplace.dto.response.MotoristaResponseDTO;
import com.win.marketplace.model.Motorista;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MotoristaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "disponivel", constant = "true")
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    Motorista toEntity(MotoristaCreateRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "usuario.email", target = "usuarioEmail")
    MotoristaResponseDTO toResponseDTO(Motorista motorista);

    List<MotoristaResponseDTO> toResponseDTOList(List<Motorista> motoristas);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    void updateEntityFromDTO(MotoristaCreateRequestDTO requestDTO, @MappingTarget Motorista motorista);
}
