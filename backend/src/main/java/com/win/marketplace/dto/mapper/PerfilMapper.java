package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.PerfilRequestDTO;
import com.win.marketplace.dto.response.PerfilResponseDTO;
import com.win.marketplace.model.Perfil;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PerfilMapper {

    /**
     * Converte PerfilRequestDTO para Perfil (Entity)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    Perfil toEntity(PerfilRequestDTO requestDTO);

    /**
     * Converte Perfil (Entity) para PerfilResponseDTO
     */
    PerfilResponseDTO toResponseDTO(Perfil perfil);

    /**
     * Atualiza uma entidade Perfil existente com dados do PerfilRequestDTO
     * Ignora campos nulos do DTO (não sobrescreve com null)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(PerfilRequestDTO requestDTO, @MappingTarget Perfil perfil);
}
