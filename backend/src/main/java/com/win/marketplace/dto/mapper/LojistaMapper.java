package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.LojistaCreateRequestDTO;
import com.win.marketplace.dto.response.LojistaResponseDTO;
import com.win.marketplace.model.Lojista;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LojistaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "avaliacaoMedia", constant = "0.0")
    @Mapping(target = "totalAvaliacoes", constant = "0")
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notasFiscais", ignore = true)
    Lojista toEntity(LojistaCreateRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "usuario.email", target = "usuarioEmail")
    LojistaResponseDTO toResponseDTO(Lojista lojista);

    List<LojistaResponseDTO> toResponseDTOList(List<Lojista> lojistas);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "produtos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notasFiscais", ignore = true)
    void updateEntityFromDTO(LojistaCreateRequestDTO requestDTO, @MappingTarget Lojista lojista);
}
