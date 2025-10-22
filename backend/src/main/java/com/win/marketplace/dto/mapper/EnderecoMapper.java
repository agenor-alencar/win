package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.EnderecoRequestDTO;
import com.win.marketplace.dto.response.EnderecoResponseDTO;
import com.win.marketplace.model.Endereco;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    Endereco toEntity(EnderecoRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    EnderecoResponseDTO toResponseDTO(Endereco endereco);

    List<EnderecoResponseDTO> toResponseDTOList(List<Endereco> enderecos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    void updateEntityFromDTO(EnderecoRequestDTO requestDTO, @MappingTarget Endereco endereco);
}
