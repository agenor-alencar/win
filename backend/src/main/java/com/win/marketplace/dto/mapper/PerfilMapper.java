package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.PerfilRequestDTO;
import com.win.marketplace.dto.response.PerfilResponseDTO;
import com.win.marketplace.model.Perfil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PerfilMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    Perfil toEntity(PerfilRequestDTO requestDTO);

    PerfilResponseDTO toResponseDTO(Perfil perfil);

    List<PerfilResponseDTO> toResponseDTOList(List<Perfil> perfis);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    void updateEntityFromDTO(PerfilRequestDTO requestDTO, @MappingTarget Perfil perfil);
}
